// app/mapbox.tsx
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import Mapbox from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

Mapbox.setAccessToken(
  "pk.eyJ1Ijoid29tcHdvbXAtNjkiLCJhIjoiY204emxrOHkwMGJsZjJrcjZtZmN4YXdtNSJ9.LIMPvoBNtGuj4O36r3F72w"
);

// ---------- Helpers ----------
const formatTimeAgo = (date: Date | null): string => {
  if (!date) return "just now";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.max(Math.floor(diffMs / 1000), 0);

  if (diffSec < 60) return "just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return diffMin === 1 ? "1 min ago" : `${diffMin} mins ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr === 1 ? "1 hr ago" : `${diffHr} hrs ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4)
    return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12)
    return diffMonth === 1 ? "1 month ago" : `${diffMonth} months ago`;

  const diffYear = Math.floor(diffDay / 365);
  return diffYear === 1 ? "1 year ago" : `${diffYear} years ago`;
};

// --- Robust image helpers (FIX for PNG/JPEG base64 + data URI + URL) ---
function guessMimeFromBase64(b64: string) {
  // JPEG base64 often starts with "/9j/"
  if (b64.startsWith("/9j/")) return "image/jpeg";
  // PNG base64 often starts with "iVBOR"
  if (b64.startsWith("iVBOR")) return "image/png";
  return "image/jpeg";
}

function toImageSource(raw?: string | null) {
  if (!raw) return null;

  // Already a full data URI
  if (raw.startsWith("data:image/")) return { uri: raw };

  // Looks like a URL
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("file:")
  ) {
    return { uri: raw };
  }

  // Assume plain base64
  const mime = guessMimeFromBase64(raw);
  return { uri: `data:${mime};base64,${raw}` };
}

// ---------- Types ----------
type Thought = {
  id: string;
  coord: [number, number]; // [lng, lat]
  text: string;
  userId: string | null;
  userName: string;
  createdAt: Date | null;
  createdAgo: string;
};

type Comment = {
  id: string;
  text: string;
  userId: string | null;
  userName: string;
  createdAt: Date | null;
  createdAgo: string;
};

type UserProfile = {
  displayName?: string | null;
  avatarBase64?: string | null; // may be raw base64 OR "data:image/...;base64,..."
};

type ThoughtWithRenderCoord = Thought & {
  renderCoord: [number, number];
};

const DEFAULT_CENTER: [number, number] = [123.8854, 10.3157]; // fallback center

// Spread overlapping thoughts a tiny bit so markers aren't exactly stacked
function jitterThoughtsForRender(thoughts: Thought[]): ThoughtWithRenderCoord[] {
  const groups: Record<string, Thought[]> = {};
  thoughts.forEach((t) => {
    const key = `${t.coord[0].toFixed(5)}|${t.coord[1].toFixed(5)}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });

  const result: ThoughtWithRenderCoord[] = [];

  Object.values(groups).forEach((group) => {
    const n = group.length;
    if (n === 1) {
      result.push({ ...group[0], renderCoord: group[0].coord });
      return;
    }

    const [baseLng, baseLat] = group[0].coord;
    const radiusMeters = 2;

    const metersPerDegLat = 111_320;
    const metersPerDegLng = 111_320 * Math.cos((baseLat * Math.PI) / 180);

    group.forEach((t, index) => {
      const angle = (2 * Math.PI * index) / n;
      const deltaLat = (Math.sin(angle) * radiusMeters) / metersPerDegLat;
      const deltaLng = (Math.cos(angle) * radiusMeters) / metersPerDegLng;

      const jittered: [number, number] = [baseLng + deltaLng, baseLat + deltaLat];

      result.push({ ...t, renderCoord: jittered });
    });
  });

  return result;
}

export default function MapboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
   // get query params like /mapbox?refresh=1
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();

  // will be computed once when this screen mounts
  const [mapKey] = useState(() =>
    refresh === "1" ? `map-login-${Date.now()}` : "map-default"
  );

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [thoughtText, setThoughtText] = useState("");

  const [selectedThought, setSelectedThought] = useState<Thought | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const commentsUnsubRef = useRef<null | (() => void)>(null);

  // camera state
  const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(null);
  const [cameraZoom, setCameraZoom] = useState<number>(5);

  // ---- AUTH USER STATE (for displayName + avatar) ----
  const [currentUser, setCurrentUser] = useState(auth().currentUser);
  // track if we already refreshed the map for this logged-in user
const [hasRefreshedForUser, setHasRefreshedForUser] = useState(false);


  // dedicated profile state for current user (fixes "need to relog" issue)
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const myProfileUnsubRef = useRef<null | (() => void)>(null);

  // All user profiles (for markers)
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  // Subscribe to auth state changes + subscribe to current user's profile doc
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      // cleanup old profile listener if any
      if (myProfileUnsubRef.current) {
        myProfileUnsubRef.current();
        myProfileUnsubRef.current = null;
      }
      setMyProfile(null);

      if (user) {
        try {
          await user.reload();
          const fresh = auth().currentUser;
          const effectiveUser = fresh ?? user;
          setCurrentUser(effectiveUser);

          if (effectiveUser?.uid) {
            myProfileUnsubRef.current = firestore()
              .collection("userProfiles")
              .doc(effectiveUser.uid)
              .onSnapshot(
                (docSnap) => {
                  if (docSnap.exists()) {
                    const d = docSnap.data() as any;
                    setMyProfile({
                      displayName: d.displayName ?? null,
                      avatarBase64: d.avatarBase64 ?? null,
                    });
                  } else {
                    setMyProfile(null);
                  }
                },
                (err) => {
                  console.log("Error listening to my profile:", err);
                  setMyProfile(null);
                }
              );
          }
        } catch (e) {
          console.log("Error reloading user:", e);
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      unsubscribe();
      if (myProfileUnsubRef.current) {
        myProfileUnsubRef.current();
        myProfileUnsubRef.current = null;
      }
    };
  }, []);

  // When a user is logged in and we haven't refreshed yet, reset map state once
useEffect(() => {
  if (currentUser && !hasRefreshedForUser) {
    console.log("Refreshing map for user:", currentUser.uid);

    // Reset map state; Mapbox.UserLocation will set the new center
    setUserLocation(null);
    setCameraCenter(null);
    setCameraZoom(5); // or any default zoom you like

    setHasRefreshedForUser(true);
  }
}, [currentUser?.uid, hasRefreshedForUser]);


  // Subscribe to all user profiles (used for markers)
  useEffect(() => {
    const unsub = firestore()
      .collection("userProfiles")
      .onSnapshot(
        (snapshot) => {
          const map: Record<string, UserProfile> = {};
          snapshot.forEach((docSnap) => {
            const d = docSnap.data() as any;
            map[docSnap.id] = {
              displayName: d.displayName ?? null,
              avatarBase64: d.avatarBase64 ?? null,
            };
          });
          setUserProfiles(map);
        },
        (err) => {
          console.log("Error loading user profiles:", err);
        }
      );

    return unsub;
  }, []);

  // Optional: if no user, send back to login
  useEffect(() => {
    if (currentUser === null) {
      router.replace("/");
    }
  }, [currentUser, router]);

  const displayName =
    myProfile?.displayName ||
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");

  // Prefer myProfile avatar; fall back to auth photoURL
  const avatarSource =
    toImageSource(myProfile?.avatarBase64) || toImageSource(currentUser?.photoURL);

  // profile menu state
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // Cleanup comments listener on unmount
  useEffect(() => {
    return () => {
      if (commentsUnsubRef.current) {
        commentsUnsubRef.current();
      }
    };
  }, []);

  // ---------- 1. Ask for location permission once ----------
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need your location to pin your thoughts on the map."
        );
        return;
      }
    })();
  }, []);

  // ---------- 1b. Listen to Mapbox blue dot to get actual coords ----------
  const handleUserLocationUpdate = (location: any) => {
    try {
      if (!location?.coords) return;
      const { longitude, latitude } = location.coords;
      const coord: [number, number] = [longitude, latitude];

      if (!userLocation) {
        setUserLocation(coord);
        setCameraCenter(coord);
        setCameraZoom(18);
      }
    } catch {
      // ignore bad updates
    }
  };

  // ---------- 2. Subscribe to Firestore thoughts ----------
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("thoughts")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs
            .map<Thought | null>((docSnap) => {
              const d = docSnap.data() as any;
              if (d.lng == null || d.lat == null || !d.text) return null;

              const createdAt: Date | null = d.createdAt?.toDate?.() ?? null;

              return {
                id: docSnap.id,
                coord: [d.lng as number, d.lat as number],
                text: String(d.text),
                userId: (d.userId ?? null) as string | null,
                userName: (d.userName ?? "Unknown user") as string,
                createdAt,
                createdAgo: formatTimeAgo(createdAt),
              };
            })
            .filter((t): t is Thought => t !== null);

          setThoughts(data);
        },
        (err) => {
          console.error("Error loading thoughts:", err);
        }
      );

    return () => unsubscribe();
  }, []);

  const isOwner =
    !!selectedThought && !!currentUser && currentUser.uid === selectedThought.userId;

  const cleanupCommentsListener = () => {
    if (commentsUnsubRef.current) {
      commentsUnsubRef.current();
      commentsUnsubRef.current = null;
    }
    setComments([]);
    setCommentText("");
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } finally {
      router.replace("/");
    }
  };

  // ---------- 3. Open modal for NEW thought ----------
  const openThoughtModal = () => {
    if (!userLocation) {
      Alert.alert("Location not ready", "Waiting for GPS fix. Try again in a moment.");
      return;
    }
    setCameraCenter(userLocation);
    setCameraZoom(19);

    cleanupCommentsListener();
    setSelectedThought(null);
    setIsEditing(false);
    setThoughtText("");
    setIsModalVisible(true);
  };

  // ---------- 4. When user taps a marker -> view + comments + zoom ----------
  const handleSelectThought = (t: Thought) => {
    setSelectedThought(t);
    setThoughtText(t.text);
    setIsEditing(false);
    setIsModalVisible(true);

    setCameraCenter(t.coord);
    setCameraZoom(19);

    cleanupCommentsListener();
    commentsUnsubRef.current = firestore()
      .collection("thoughts")
      .doc(t.id)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs
            .map<Comment | null>((docSnap) => {
              const d = docSnap.data() as any;
              if (!d.text) return null;

              const createdAt: Date | null = d.createdAt?.toDate?.() ?? null;

              return {
                id: docSnap.id,
                text: String(d.text),
                userId: (d.userId ?? null) as string | null,
                userName: (d.userName ?? "Unknown user") as string,
                createdAt,
                createdAgo: formatTimeAgo(createdAt),
              };
            })
            .filter((c): c is Comment => c !== null);
          setComments(data);
        },
        (err) => {
          console.error("Error loading comments:", err);
        }
      );
  };

  // ---------- 5. Save (create or update thought) ----------
  const handleSaveThought = async () => {
    if (!thoughtText.trim()) {
      Alert.alert("Empty thought", "Please type something first.");
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    if (isEditing && selectedThought) {
      try {
        await firestore().collection("thoughts").doc(selectedThought.id).update({
          text: thoughtText.trim(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        setIsEditing(false);
        setSelectedThought((prev) => (prev ? { ...prev, text: thoughtText.trim() } : prev));
      } catch (e) {
        console.error("Error updating thought:", e);
        Alert.alert("Error", "Could not update your thought.");
      }
      return;
    }

    if (!userLocation) {
      Alert.alert("Location not ready", "We couldn't get your location yet.");
      return;
    }

    const [lng, lat] = userLocation;
    const email = user.email ?? "unknown@example.com";
    const derivedName = email.split("@")[0];
    const userName = user.displayName || derivedName;

    try {
      await firestore().collection("thoughts").add({
        text: thoughtText.trim(),
        lng,
        lat,
        userId: user.uid,
        userName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setThoughtText("");
      setIsModalVisible(false);
    } catch (e) {
      console.error("Error saving thought:", e);
      Alert.alert("Error", "Could not save your thought. Please try again.");
    }
  };

  // ---------- 6. Delete thought ----------
  const handleDeleteThought = () => {
    if (!selectedThought) return;

    const user = auth().currentUser;
    if (!user || user.uid !== selectedThought.userId) {
      Alert.alert("Not allowed", "You can only delete your own thoughts.");
      return;
    }

    Alert.alert("Delete thought", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await firestore().collection("thoughts").doc(selectedThought.id).delete();

            setThoughtText("");
            setIsModalVisible(false);
            setIsEditing(false);
            setSelectedThought(null);
            cleanupCommentsListener();
          } catch (e) {
            console.error("Error deleting thought:", e);
            Alert.alert("Error", "Could not delete your thought.");
          }
        },
      },
    ]);
  };

  // ---------- 7. Add comment ----------
  const handleAddComment = async () => {
    if (!selectedThought) return;
    if (!commentText.trim()) return;

    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    const email = user.email ?? "unknown@example.com";
    const derivedName = email.split("@")[0];
    const userName = user.displayName || derivedName;

    try {
      await firestore()
        .collection("thoughts")
        .doc(selectedThought.id)
        .collection("comments")
        .add({
          text: commentText.trim(),
          userId: user.uid,
          userName,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      setCommentText("");
    } catch (e) {
      console.error("Error adding comment:", e);
      Alert.alert("Error", "Could not post your comment.");
    }
  };

  // ---------- 8. Start editing a comment ----------
  const handleStartEditComment = (comment: Comment) => {
    const user = auth().currentUser;
    if (!user || user.uid !== comment.userId) return;

    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  // ---------- 9. Save edited comment ----------
  const handleSaveEditedComment = async () => {
    if (!selectedThought || !editingCommentId) return;
    if (!editingCommentText.trim()) {
      Alert.alert("Empty comment", "Please type something first.");
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    try {
      await firestore()
        .collection("thoughts")
        .doc(selectedThought.id)
        .collection("comments")
        .doc(editingCommentId)
        .update({
          text: editingCommentText.trim(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      setEditingCommentId(null);
      setEditingCommentText("");
    } catch (e) {
      console.error("Error updating comment:", e);
      Alert.alert("Error", "Could not update your comment.");
    }
  };

  // ---------- 10. Delete comment ----------
  const handleDeleteComment = (comment: Comment) => {
    if (!selectedThought) return;

    const user = auth().currentUser;
    if (!user || user.uid !== comment.userId) {
      Alert.alert("Not allowed", "You can only delete your own comments.");
      return;
    }

    Alert.alert("Delete comment", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await firestore()
              .collection("thoughts")
              .doc(selectedThought.id)
              .collection("comments")
              .doc(comment.id)
              .delete();
          } catch (e) {
            console.error("Error deleting comment:", e);
            Alert.alert("Error", "Could not delete your comment.");
          }
        },
      },
    ]);
  };

  // ---------- 11. Cancel / close modal ----------
  const handleCancel = () => {
    setThoughtText("");
    setIsModalVisible(false);
    setIsEditing(false);
    setSelectedThought(null);
    cleanupCommentsListener();
  };

  const fallbackCenter = userLocation ?? DEFAULT_CENTER;

  const jitteredThoughts = useMemo(() => jitterThoughtsForRender(thoughts), [thoughts]);

  // ---------- UI ----------
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appTitle}>GeoThoughts</Text>
            <Text style={styles.appSubtitle}>Drop how you feel on the map</Text>
          </View>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setIsProfileModalVisible(true)}
          >
            {avatarSource ? (
              <Image source={avatarSource} style={styles.profileImage} resizeMode="cover" />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Map card */}
<View style={styles.mapCard}>
  <Mapbox.MapView
    key={mapKey} // <-- this forces a remount when coming from login with refresh=1
    style={styles.map}
    styleURL={Mapbox.StyleURL.Street}
  >
    <Mapbox.Camera
      centerCoordinate={cameraCenter ?? fallbackCenter}
      zoomLevel={cameraZoom}
      animationMode="flyTo"
      animationDuration={1000}
    />

    <Mapbox.UserLocation visible onUpdate={handleUserLocationUpdate} />

    {jitteredThoughts.map((t) => {
      const profile = t.userId ? userProfiles[t.userId] : undefined;

      // FIXED: robust base64/data-uri support
      const markerAvatarSource = toImageSource(profile?.avatarBase64);
      const markerInitial =
        (t.userName && t.userName.charAt(0).toUpperCase()) || "?";

      return (
        <Mapbox.PointAnnotation
          key={t.id}
          id={t.id}
          coordinate={t.renderCoord}
          onSelected={() => handleSelectThought(t)}
        >
          <View style={styles.marker}>
            {markerAvatarSource ? (
              <Image
                source={markerAvatarSource}
                style={styles.markerImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.markerInitial}>{markerInitial}</Text>
            )}
          </View>
          <Mapbox.Callout title={`${t.userName}: ${t.text}`} />
        </Mapbox.PointAnnotation>
      );
    })}
  </Mapbox.MapView>
</View>


        {/* Share bar */}
        <View style={[styles.shareBarWrapper, { paddingBottom: insets.bottom + 4 }]}>
          <TouchableOpacity style={styles.shareBar} onPress={openThoughtModal}>
            <Text style={styles.sharePlus}>＋</Text>
            <Text style={styles.shareText}>Share thought</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile modal */}
      <Modal
        visible={isProfileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.profileModalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsProfileModalVisible(false)}
        >
          <View style={styles.profileModalCard}>
            {avatarSource ? (
              <Image source={avatarSource} style={styles.profileImageBig} resizeMode="cover" />
            ) : (
              <View style={styles.profilePlaceholderBig}>
                <Text style={styles.profileInitialBig}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.profileName}>{displayName}</Text>
            {currentUser?.email && <Text style={styles.profileEmail}>{currentUser.email}</Text>}

            <TouchableOpacity
              style={styles.profileLogoutButton}
              onPress={() => {
                setIsProfileModalVisible(false);
                handleLogout();
              }}
            >
              <Text style={styles.profileLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Thought modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedThought ? (
              <>
                <Text style={styles.modalTitle}>Thought by {selectedThought.userName}</Text>
                <Text style={styles.timestampText}>{selectedThought.createdAgo}</Text>

                {isEditing ? (
                  <>
                    <TextInput
                      style={styles.modalInput}
                      value={thoughtText}
                      onChangeText={setThoughtText}
                      multiline
                    />
                    <View style={styles.ownerActionsRow}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalCancel]}
                        onPress={() => {
                          setIsEditing(false);
                          setThoughtText(selectedThought.text);
                        }}
                      >
                        <Text style={styles.modalButtonText}>Cancel edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.modalSave]}
                        onPress={handleSaveThought}
                      >
                        <Text style={[styles.modalButtonText, { color: "#fff" }]}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.thoughtText}>{selectedThought.text}</Text>
                    {isOwner && (
                      <View style={styles.ownerActionsRow}>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalCancel]}
                          onPress={() => setIsEditing(true)}
                        >
                          <Text style={styles.modalButtonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.modalButton, styles.modalDelete]}
                          onPress={handleDeleteThought}
                        >
                          <Text style={[styles.modalButtonText, styles.modalDeleteText]}>
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}

                <Text style={styles.commentsTitle}>Comments</Text>
                <ScrollView style={styles.commentsList}>
                  {comments.length === 0 ? (
                    <Text style={styles.noCommentsText}>
                      No comments yet. Be the first to comment!
                    </Text>
                  ) : (
                    comments.map((c) => {
                      const isMyComment = currentUser && currentUser.uid === c.userId;
                      const isEditingThis = editingCommentId === c.id;

                      return (
                        <View key={c.id} style={styles.commentItem}>
                          <View style={styles.commentHeaderRow}>
                            <View>
                              <Text style={styles.commentAuthor}>{c.userName}</Text>
                              <Text style={styles.commentTimestamp}>{c.createdAgo}</Text>
                            </View>
                            {isMyComment && !isEditingThis && (
                              <View style={styles.commentActionsRow}>
                                <TouchableOpacity
                                  style={styles.commentAction}
                                  onPress={() => handleStartEditComment(c)}
                                >
                                  <Text style={styles.commentActionText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.commentAction}
                                  onPress={() => handleDeleteComment(c)}
                                >
                                  <Text style={[styles.commentActionText, styles.commentDeleteText]}>
                                    Delete
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>

                          {isEditingThis ? (
                            <View style={styles.commentEditBlock}>
                              <TextInput
                                style={styles.commentEditInput}
                                value={editingCommentText}
                                onChangeText={setEditingCommentText}
                                multiline
                              />
                              <View style={styles.commentEditButtonsRow}>
                                <TouchableOpacity
                                  style={[styles.commentEditButton, styles.modalCancel]}
                                  onPress={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentText("");
                                  }}
                                >
                                  <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.commentEditButton, styles.modalSave]}
                                  onPress={handleSaveEditedComment}
                                >
                                  <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                                    Save
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.commentText}>{c.text}</Text>
                          )}
                        </View>
                      );
                    })
                  )}
                </ScrollView>

                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write a comment..."
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.modalButtons, { marginTop: 16 }]}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancel]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.modalButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>What is your thought?</Text>
                <Text style={styles.timestampText}>It will be pinned here.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Type something..."
                  value={thoughtText}
                  onChangeText={setThoughtText}
                  multiline
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancel]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSave]}
                    onPress={handleSaveThought}
                  >
                    <Text style={[styles.modalButtonText, { color: "#fff" }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const AVATAR_SIZE = 40;
const AVATAR_SIZE_BIG = 72;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 16,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#020617",
  },
  appSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },

  profileButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e5e7eb",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  profilePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#cbd5f5",
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },

  profileModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 56,
    paddingRight: 16,
  },
  profileModalCard: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    alignItems: "center",
  },
  profileImageBig: {
    width: AVATAR_SIZE_BIG,
    height: AVATAR_SIZE_BIG,
    borderRadius: AVATAR_SIZE_BIG / 2,
    marginBottom: 8,
  },
  profilePlaceholderBig: {
    width: AVATAR_SIZE_BIG,
    height: AVATAR_SIZE_BIG,
    borderRadius: AVATAR_SIZE_BIG / 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#cbd5f5",
    marginBottom: 8,
  },
  profileInitialBig: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1f2937",
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },
  profileLogoutButton: {
    marginTop: 4,
    width: "100%",
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  profileLogoutText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: 14,
  },

  mapCard: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
  },
  map: {
    flex: 1,
  },

  shareBarWrapper: {
    alignItems: "center",
    paddingTop: 12,
  },
  shareBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  sharePlus: {
    color: "#e5e7eb",
    fontSize: 20,
    marginRight: 8,
  },
  shareText: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "600",
  },

  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },
  markerImage: {
    width: "100%",
    height: "100%",
  },
  markerInitial: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "90%",
    maxHeight: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#020617",
  },
  timestampText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 8,
  },
  modalInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#f9fafb",
  },
  thoughtText: {
    fontSize: 16,
    color: "#111827",
  },
  ownerActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    flexWrap: "wrap",
  },

  commentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  commentsList: {
    maxHeight: 200,
  },
  noCommentsText: {
    color: "#6b7280",
    fontStyle: "italic",
  },
  commentItem: {
    marginBottom: 8,
  },
  commentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  commentActionsRow: {
    flexDirection: "row",
  },
  commentAction: {
    marginLeft: 8,
  },
  commentActionText: {
    fontSize: 12,
    color: "#1d4ed8",
  },
  commentDeleteText: {
    color: "#b91c1c",
  },
  commentAuthor: {
    fontWeight: "600",
    color: "#111827",
  },
  commentTimestamp: {
    fontSize: 11,
    color: "#9ca3af",
  },
  commentText: {
    color: "#374151",
    marginTop: 2,
  },

  commentEditBlock: {
    marginTop: 4,
  },
  commentEditInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlignVertical: "top",
  },
  commentEditButtonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  commentEditButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },

  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: "#f9fafb",
  },
  sendButton: {
    backgroundColor: "#1d4ed8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "500",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    flexWrap: "wrap",
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
    marginTop: 4,
  },
  modalCancel: {
    backgroundColor: "#e5e7eb",
  },
  modalSave: {
    backgroundColor: "#1d4ed8",
  },
  modalButtonText: {
    color: "#111827",
    fontWeight: "500",
  },
  modalDelete: {
    backgroundColor: "#fee2e2",
  },
  modalDeleteText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
});

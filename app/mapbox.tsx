// app/mapbox.tsx — CitiWatch
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import Mapbox from "@rnmapbox/maps";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  AVATAR_SIZE_BIG,
  CATEGORY_EMOJI,
  DEFAULT_CENTER,
  REPORT_CATEGORIES,
  STATUS_COLOR,
} from "../mapscreen/constants";
import {
  formatTimeAgo,
  jitterReportsForRender,
  toImageSource,
} from "../mapscreen/helpers";
import s from "../mapscreen/styles";
import type {
  Comment,
  Report,
  ReportCategory,
  UserProfile,
} from "../mapscreen/types";
const MAPBOX_TOKEN = "";

Mapbox.setAccessToken(MAPBOX_TOKEN);

// ── Screen ───────────────────────────────
export default function MapboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();

  const [mapKey] = useState(() =>
    refresh === "1" ? `map-login-${Date.now()}` : "map-default",
  );

  // ── Location ─────────────────────────────
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );

  // ── Reports ──────────────────────────────
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ── New / edit form state ─────────────────
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>(
    REPORT_CATEGORIES[0],
  );
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // ── Comments ─────────────────────────────
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const commentsUnsubRef = useRef<null | (() => void)>(null);

  // ── Camera ───────────────────────────────
  const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(
    null,
  );
  const [cameraZoom, setCameraZoom] = useState<number>(5);

  // ── Auth + Profile ────────────────────────
  const [currentUser, setCurrentUser] = useState(auth().currentUser);
  const [hasRefreshedForUser, setHasRefreshedForUser] = useState(false);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const myProfileUnsubRef = useRef<null | (() => void)>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {},
  );
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarSource, setAvatarSource] = useState<{ uri: string } | null>(
    null,
  );
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // ── Auth + profile subscription ──────────
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (typeof myProfileUnsubRef.current === "function") {
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
            try {
              const profileDoc = await firestore()
                .collection("userProfiles")
                .doc(effectiveUser.uid)
                .get();
              const d = profileDoc.data() as any | undefined;
              if (d)
                setMyProfile({
                  displayName: d.displayName ?? null,
                  avatarBase64: d.avatarBase64 ?? null,
                });
            } catch (err) {
              console.log("Error fetching initial profile:", err);
            }

            myProfileUnsubRef.current = firestore()
              .collection("userProfiles")
              .doc(effectiveUser.uid)
              .onSnapshot(
                (docSnap) => {
                  const d = docSnap.data() as any | undefined;
                  if (d)
                    setMyProfile({
                      displayName: d.displayName ?? null,
                      avatarBase64: d.avatarBase64 ?? null,
                    });
                  else setMyProfile(null);
                },
                (err) => console.log("Error listening to my profile:", err),
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
      if (typeof myProfileUnsubRef.current === "function") {
        myProfileUnsubRef.current();
        myProfileUnsubRef.current = null;
      }
    };
  }, []);

  // One-time map reset per user
  useEffect(() => {
    if (currentUser && !hasRefreshedForUser) {
      setUserLocation(null);
      setCameraCenter(null);
      setCameraZoom(5);
      setHasRefreshedForUser(true);
    }
  }, [currentUser?.uid, hasRefreshedForUser]);

  // All user profiles (for markers)
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
        (err) => console.log("Error loading user profiles:", err),
      );
    return unsub;
  }, []);

  // Redirect if signed out
  useEffect(() => {
    if (currentUser === null) router.replace("/");
  }, [currentUser, router]);

  // Avatar source
  useEffect(() => {
    const source =
      toImageSource(myProfile?.avatarBase64 ?? null) ||
      toImageSource(currentUser?.photoURL ?? null);
    setAvatarSource(source);
    setAvatarLoading(false);
  }, [myProfile?.avatarBase64, currentUser?.photoURL]);

  // Cleanup comments on unmount
  useEffect(() => {
    return () => {
      if (typeof commentsUnsubRef.current === "function") {
        commentsUnsubRef.current();
        commentsUnsubRef.current = null;
      }
    };
  }, []);

  // Location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need your location to pin reports on the map.",
        );
      }
    })();
  }, []);

  // Reports subscription
  useEffect(() => {
    const unsubscribe = firestore()
      .collection("reports")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const data = snapshot.docs
            .map<Report | null>((docSnap) => {
              const d = docSnap.data() as any;
              if (d.lng == null || d.lat == null || !d.description) return null;
              const createdAt: Date | null = d.createdAt?.toDate?.() ?? null;

              return {
                id: docSnap.id,
                coord: [d.lng as number, d.lat as number],
                description: String(d.description),
                category: (d.category ??
                  REPORT_CATEGORIES[0]) as ReportCategory,
                status: (d.status ?? "pending") as "pending" | "resolved",
                imageBase64: (d.imageBase64 ?? null) as string | null,
                userId: (d.userId ?? null) as string | null,
                userName: (d.userName ?? "Unknown user") as string,
                createdAt,
                createdAgo: formatTimeAgo(createdAt),
              };
            })
            .filter((r): r is Report => r !== null);

          setReports(data);
        },
        (err) => console.error("Error loading reports:", err),
      );

    return () => unsubscribe();
  }, []);

  // ── Derived values ────────────────────────
  const displayName =
    myProfile?.displayName ||
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");

  const isOwner =
    !!selectedReport &&
    !!currentUser &&
    currentUser.uid === selectedReport.userId;

  const fallbackCenter = userLocation ?? DEFAULT_CENTER;
  const jitteredReports = useMemo(
    () => jitterReportsForRender(reports),
    [reports],
  );

  // ── Helpers ───────────────────────────────
  const resetForm = () => {
    setDescription("");
    setSelectedCategory(REPORT_CATEGORIES[0]);
    setImageUri(null);
    setImageBase64(null);
  };

  const cleanupCommentsListener = () => {
    if (typeof commentsUnsubRef.current === "function") {
      commentsUnsubRef.current();
      commentsUnsubRef.current = null;
    }
    setComments([]);
    setCommentText("");
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  // ── Handlers ─────────────────────────────
  const handleLogout = async () => {
    try {
      await auth().signOut();
    } finally {
      router.replace("/");
    }
  };

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
      /* ignore */
    }
  };

  // Pick image for report
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      const mime = asset.mimeType ?? "image/jpeg";
      const dataUri = asset.base64
        ? `data:${mime};base64,${asset.base64}`
        : null;
      setImageBase64(dataUri);
    }
  };

  // Open new report modal
  const openReportModal = () => {
    if (!userLocation) {
      Alert.alert(
        "Location not ready",
        "Waiting for GPS fix. Please log out and log in again.",
      );
      return;
    }
    setCameraCenter(userLocation);
    setCameraZoom(19);
    cleanupCommentsListener();
    setSelectedReport(null);
    setIsEditing(false);
    resetForm();
    setIsModalVisible(true);
  };

  // Select a report on map
  const handleSelectReport = (r: Report) => {
    setSelectedReport(r);
    setDescription(r.description);
    setSelectedCategory(r.category);
    setImageUri(toImageSource(r.imageBase64)?.uri ?? null);
    setImageBase64(r.imageBase64);
    setIsEditing(false);
    setIsModalVisible(true);
    setCameraCenter(r.coord);
    setCameraZoom(19);

    cleanupCommentsListener();
    commentsUnsubRef.current = firestore()
      .collection("reports")
      .doc(r.id)
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
        (err) => console.error("Error loading comments:", err),
      );
  };

  // Save new report
  const handleSaveReport = async () => {
    if (!description.trim()) {
      Alert.alert("Missing description", "Please describe the issue.");
      return;
    }
    if (!imageBase64) {
      Alert.alert("Photo required", "Please attach a photo of the issue.");
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }

    if (isEditing && selectedReport) {
      try {
        await firestore().collection("reports").doc(selectedReport.id).update({
          description: description.trim(),
          category: selectedCategory,
          imageBase64: imageBase64,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        setIsEditing(false);
        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                description: description.trim(),
                category: selectedCategory,
                imageBase64,
              }
            : prev,
        );
      } catch (e) {
        console.error("Error updating report:", e);
        Alert.alert("Error", "Could not update your report.");
      }
      return;
    }

    if (!userLocation) {
      Alert.alert("Location not ready", "We couldn't get your location yet.");
      return;
    }

    const [lng, lat] = userLocation;
    const userName =
      user.displayName || (user.email ?? "unknown").split("@")[0];

    try {
      await firestore().collection("reports").add({
        description: description.trim(),
        category: selectedCategory,
        status: "pending",
        imageBase64: imageBase64,
        lng,
        lat,
        userId: user.uid,
        userName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      resetForm();
      setIsModalVisible(false);
    } catch (e) {
      console.error("Error saving report:", e);
      Alert.alert("Error", "Could not save your report. Please try again.");
    }
  };

  // Delete report
  const handleDeleteReport = () => {
    if (!selectedReport) return;
    const user = auth().currentUser;
    if (!user || user.uid !== selectedReport.userId) {
      Alert.alert("Not allowed", "You can only delete your own reports.");
      return;
    }
    Alert.alert(
      "Delete report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await firestore()
                .collection("reports")
                .doc(selectedReport.id)
                .delete();
              setIsModalVisible(false);
              setIsEditing(false);
              setSelectedReport(null);
              resetForm();
              cleanupCommentsListener();
            } catch (e) {
              console.error("Error deleting report:", e);
              Alert.alert("Error", "Could not delete your report.");
            }
          },
        },
      ],
    );
  };

  // Add comment
  const handleAddComment = async () => {
    if (!selectedReport || !commentText.trim()) return;
    const user = auth().currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }
    const userName =
      user.displayName || (user.email ?? "unknown").split("@")[0];
    try {
      await firestore()
        .collection("reports")
        .doc(selectedReport.id)
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

  const handleStartEditComment = (comment: Comment) => {
    const user = auth().currentUser;
    if (!user || user.uid !== comment.userId) return;
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const handleSaveEditedComment = async () => {
    if (!selectedReport || !editingCommentId) return;
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
        .collection("reports")
        .doc(selectedReport.id)
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

  const handleDeleteComment = (comment: Comment) => {
    if (!selectedReport) return;
    const user = auth().currentUser;
    if (!user || user.uid !== comment.userId) {
      Alert.alert("Not allowed", "You can only delete your own comments.");
      return;
    }
    Alert.alert("Delete comment", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await firestore()
              .collection("reports")
              .doc(selectedReport.id)
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

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditing(false);
    setSelectedReport(null);
    resetForm();
    cleanupCommentsListener();
  };

  // ── JSX ──────────────────────────────────
  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.screen}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.appTitle}>
              CITI<Text style={s.appAccent}>WATCH</Text>
            </Text>
            <Text style={s.appSubtitle}>Pin civic issues on the map</Text>
          </View>
          <TouchableOpacity
            style={s.profileButton}
            onPress={() => setIsProfileModalVisible(true)}
          >
            {avatarLoading ? (
              <View style={s.profilePlaceholder}>
                <ActivityIndicator size="small" color="#1A6BF5" />
              </View>
            ) : avatarSource ? (
              <Image
                source={avatarSource}
                style={s.profileImage}
                resizeMode="cover"
                onError={() => setAvatarLoading(false)}
              />
            ) : (
              <View style={s.profilePlaceholder}>
                <Text style={s.profileInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={s.mapCard}>
          <Mapbox.MapView
            key={mapKey}
            style={s.map}
            styleURL={Mapbox.StyleURL.Street}
          >
            <Mapbox.Camera
              centerCoordinate={cameraCenter ?? fallbackCenter}
              zoomLevel={cameraZoom}
              animationMode="flyTo"
              animationDuration={1000}
            />
            <Mapbox.UserLocation visible onUpdate={handleUserLocationUpdate} />

            {jitteredReports.map((r) => (
              <Mapbox.PointAnnotation
                key={r.id}
                id={r.id}
                coordinate={r.renderCoord}
                onSelected={() => handleSelectReport(r)}
              >
                <View style={s.marker}>
                  <Text style={s.markerEmoji}>
                    {CATEGORY_EMOJI[r.category]}
                  </Text>
                </View>
                <Mapbox.Callout title={`${r.category} — ${r.userName}`} />
              </Mapbox.PointAnnotation>
            ))}
          </Mapbox.MapView>
        </View>

        {/* FAB */}
        <View style={[s.shareBarWrapper, { paddingBottom: insets.bottom + 4 }]}>
          <TouchableOpacity style={s.shareBar} onPress={openReportModal}>
            <Text style={s.sharePlus}>＋</Text>
            <Text style={s.shareText}>File a Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Profile Modal ── */}
      <Modal
        visible={isProfileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        <TouchableOpacity
          style={s.profileModalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsProfileModalVisible(false)}
        >
          <View style={s.profileModalCard}>
            {avatarSource ? (
              <Image
                source={avatarSource}
                style={s.profileImageBig}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  s.profilePlaceholderBig,
                  { width: AVATAR_SIZE_BIG, height: AVATAR_SIZE_BIG },
                ]}
              >
                <Text style={s.profileInitialBig}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={s.profileName}>{displayName}</Text>
            {currentUser?.email && (
              <Text style={s.profileEmail}>{currentUser.email}</Text>
            )}
            <TouchableOpacity
              style={s.profileLogoutButton}
              onPress={() => {
                setIsProfileModalVisible(false);
                handleLogout();
              }}
            >
              <Text style={s.profileLogoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Report Modal ── */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* ── VIEW existing report ── */}
              {selectedReport && !isEditing ? (
                <>
                  <Text style={s.modalTitle}>{selectedReport.category}</Text>
                  <Text style={s.timestampText}>
                    By {selectedReport.userName} · {selectedReport.createdAgo}
                  </Text>

                  {/* Status badge */}
                  <View
                    style={[
                      s.statusBadge,
                      { backgroundColor: STATUS_COLOR[selectedReport.status] },
                    ]}
                  >
                    <Text style={s.statusBadgeText}>
                      {selectedReport.status === "resolved"
                        ? "✓ Resolved"
                        : "⏳ Pending"}
                    </Text>
                  </View>

                  {/* Photo */}
                  {selectedReport.imageBase64 && (
                    <Image
                      source={toImageSource(selectedReport.imageBase64)!}
                      style={s.reportImageFull}
                      resizeMode="cover"
                    />
                  )}

                  <Text style={s.reportCategory}>
                    {selectedReport.category}
                  </Text>
                  <Text style={s.reportDescription}>
                    {selectedReport.description}
                  </Text>

                  {isOwner && (
                    <View style={s.ownerActionsRow}>
                      <TouchableOpacity
                        style={[s.modalButton, s.modalCancel]}
                        onPress={() => setIsEditing(true)}
                      >
                        <Text style={s.modalButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[s.modalButton, s.modalDelete]}
                        onPress={handleDeleteReport}
                      >
                        <Text style={s.modalDeleteText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Comments */}
                  <Text style={s.commentsTitle}>Comments</Text>
                  {comments.length === 0 ? (
                    <Text style={s.noCommentsText}>
                      No comments yet. Be the first!
                    </Text>
                  ) : (
                    comments.map((c) => {
                      const isMyComment =
                        currentUser && currentUser.uid === c.userId;
                      const isEditingThis = editingCommentId === c.id;
                      return (
                        <View key={c.id} style={s.commentItem}>
                          <View style={s.commentHeaderRow}>
                            <View>
                              <Text style={s.commentAuthor}>{c.userName}</Text>
                              <Text style={s.commentTimestamp}>
                                {c.createdAgo}
                              </Text>
                            </View>
                            {isMyComment && !isEditingThis && (
                              <View style={s.commentActionsRow}>
                                <TouchableOpacity
                                  onPress={() => handleStartEditComment(c)}
                                >
                                  <Text style={s.commentActionText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  onPress={() => handleDeleteComment(c)}
                                >
                                  <Text
                                    style={[
                                      s.commentActionText,
                                      s.commentDeleteText,
                                    ]}
                                  >
                                    Delete
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                          {isEditingThis ? (
                            <View style={s.commentEditBlock}>
                              <TextInput
                                style={s.commentEditInput}
                                value={editingCommentText}
                                onChangeText={setEditingCommentText}
                                multiline
                              />
                              <View style={s.commentEditButtonsRow}>
                                <TouchableOpacity
                                  style={[s.commentEditButton, s.modalCancel]}
                                  onPress={() => {
                                    setEditingCommentId(null);
                                    setEditingCommentText("");
                                  }}
                                >
                                  <Text style={s.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[s.commentEditButton, s.modalSave]}
                                  onPress={handleSaveEditedComment}
                                >
                                  <Text style={s.modalSaveText}>Save</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <Text style={s.commentText}>{c.text}</Text>
                          )}
                        </View>
                      );
                    })
                  )}

                  <View style={s.commentInputRow}>
                    <TextInput
                      style={s.commentInput}
                      placeholder="Write a comment..."
                      placeholderTextColor="#A0AECB"
                      value={commentText}
                      onChangeText={setCommentText}
                    />
                    <TouchableOpacity
                      style={s.sendButton}
                      onPress={handleAddComment}
                    >
                      <Text style={s.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[s.modalButtons, { marginTop: 16 }]}>
                    <TouchableOpacity
                      style={[s.modalButton, s.modalCancel]}
                      onPress={handleCancel}
                    >
                      <Text style={s.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* ── CREATE / EDIT report form ── */
                <>
                  <Text style={s.modalTitle}>
                    {isEditing ? "Edit Report" : "File a Report"}
                  </Text>
                  <Text style={s.timestampText}>
                    {isEditing
                      ? "Update the details below."
                      : "Your location will be pinned automatically."}
                  </Text>

                  {/* Category picker */}
                  <Text style={s.categoryLabel}>CATEGORY</Text>
                  <View style={s.categoryGrid}>
                    {REPORT_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          s.categoryChip,
                          selectedCategory === cat && s.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text>{CATEGORY_EMOJI[cat]}</Text>
                        <Text
                          style={[
                            s.categoryChipText,
                            selectedCategory === cat &&
                              s.categoryChipTextActive,
                          ]}
                        >
                          {cat.split(" ").slice(1).join(" ")}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Photo upload */}
                  <Text style={s.imageLabel}>PHOTO EVIDENCE (REQUIRED)</Text>
                  <TouchableOpacity
                    style={s.imagePickerBtn}
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    {imageUri ? (
                      <Image
                        source={{ uri: imageUri }}
                        style={s.imagePreview}
                        resizeMode="cover"
                      />
                    ) : (
                      <>
                        <Text style={s.imagePickerEmoji}>📷</Text>
                        <Text style={s.imagePickerText}>
                          Tap to attach a photo
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Description */}
                  <Text style={s.descriptionLabel}>DESCRIPTION</Text>
                  <TextInput
                    style={s.modalInput}
                    placeholder="Describe the issue in detail..."
                    placeholderTextColor="#A0AECB"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />

                  <View style={s.modalButtons}>
                    <TouchableOpacity
                      style={[s.modalButton, s.modalCancel]}
                      onPress={
                        isEditing
                          ? () => {
                              setIsEditing(false);
                            }
                          : handleCancel
                      }
                    >
                      <Text style={s.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.modalButton, s.modalSave]}
                      onPress={handleSaveReport}
                    >
                      <Text style={s.modalSaveText}>
                        {isEditing ? "Update" : "Submit Report"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

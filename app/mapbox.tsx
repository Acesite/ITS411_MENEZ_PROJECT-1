// app/mapbox.tsx — CitiWatch Bacolod
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
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  CATEGORY_EMOJI,
  CATEGORY_GROUPS,
  DEFAULT_CENTER,
  FILTER_ALL,
  FilterOption,
  GROUP_COLOR,
  REPORT_CATEGORIES,
} from "../mapscreen/constants";
import {
  formatTimeAgo,
  jitterReportsForRender,
  toImageSource,
} from "../mapscreen/helpers";
import { C, s } from "../mapscreen/mapstyles";
import { ReportModal } from "../mapscreen/reportmodal";
import { StepperModal } from "../mapscreen/steppermodal";
import type {
  Comment,
  Report,
  ReportCategory,
  ReportPriority,
  UserProfile,
} from "../mapscreen/types";

const getEmoji = (cat: string) => CATEGORY_EMOJI[cat as ReportCategory] ?? "📍";
const toCategory = (raw: any): ReportCategory =>
  REPORT_CATEGORIES.includes(raw)
    ? (raw as ReportCategory)
    : REPORT_CATEGORIES[0];
const toPriority = (raw: any): ReportPriority =>
  raw === "Low" || raw === "Medium" || raw === "High"
    ? (raw as ReportPriority)
    : "Medium";

const FILTERS = [
  { label: "All", emoji: "🗺️", value: FILTER_ALL as FilterOption },
  {
    label: "Infrastructure",
    emoji: "🏗️",
    value: "Infrastructure" as FilterOption,
  },
  { label: "Hazards", emoji: "⚠️", value: "Hazards" as FilterOption },
  { label: "Public Order", emoji: "🚨", value: "Public Order" as FilterOption },
  { label: "Environment", emoji: "🌿", value: "Environment" as FilterOption },
];

function useUnsub(ref: React.MutableRefObject<(() => void) | null>) {
  return () => {
    if (typeof ref.current === "function") {
      ref.current();
      ref.current = null;
    }
  };
}

export default function MapboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refresh } = useLocalSearchParams<{ refresh?: string }>();
  const [mapKey] = useState(() =>
    refresh === "1" ? `map-login-${Date.now()}` : "map-default",
  );

  // Map / reports
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [reports, setReports] = useState<Report[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterOption>(FILTER_ALL);
  const [cameraCenter, setCameraCenter] = useState<[number, number] | null>(
    null,
  );
  const [cameraZoom, setCameraZoom] = useState(12);

  // Modals
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // Form
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>(
    REPORT_CATEGORIES[0],
  );
  const [priority, setPriority] = useState<ReportPriority>("Medium");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const commentsUnsubRef = useRef<(() => void) | null>(null);
  const cleanupComments = useUnsub(commentsUnsubRef);

  // Auth / profile
  const [currentUser, setCurrentUser] = useState(auth().currentUser);
  const [hasRefreshedForUser, setHasRefreshedForUser] = useState(false);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>(
    {},
  );
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarSource, setAvatarSource] = useState<{ uri: string } | null>(
    null,
  );
  const myProfileUnsubRef = useRef<(() => void) | null>(null);
  const cleanupMyProfile = useUnsub(myProfileUnsubRef);

  // ── Auth ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async (user) => {
      cleanupMyProfile();
      setMyProfile(null);
      if (!user) {
        setCurrentUser(null);
        return;
      }
      try {
        await user.reload();
      } catch {
        /* ignore */
      }
      const u = auth().currentUser ?? user;
      setCurrentUser(u);
      if (u?.uid) {
        try {
          const doc = await firestore()
            .collection("userProfiles")
            .doc(u.uid)
            .get();
          const d = doc.data() as any;
          if (d)
            setMyProfile({
              displayName: d.displayName ?? null,
              avatarBase64: d.avatarBase64 ?? null,
            });
        } catch {
          /* ignore */
        }
        myProfileUnsubRef.current = firestore()
          .collection("userProfiles")
          .doc(u.uid)
          .onSnapshot(
            (snap) => {
              const d = snap.data() as any;
              setMyProfile(
                d
                  ? {
                      displayName: d.displayName ?? null,
                      avatarBase64: d.avatarBase64 ?? null,
                    }
                  : null,
              );
            },
            (err) => console.log("Profile listen error:", err),
          );
      }
    });
    return () => {
      unsub();
      cleanupMyProfile();
    };
  }, []);

  useEffect(() => {
    if (currentUser && !hasRefreshedForUser) {
      setUserLocation(null);
      setCameraCenter(null);
      setCameraZoom(12);
      setHasRefreshedForUser(true);
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    return firestore()
      .collection("userProfiles")
      .onSnapshot(
        (snap) => {
          const map: Record<string, UserProfile> = {};
          snap.forEach((doc) => {
            const d = doc.data() as any;
            map[doc.id] = {
              displayName: d.displayName ?? null,
              avatarBase64: d.avatarBase64 ?? null,
            };
          });
          setUserProfiles(map);
        },
        (err) => console.log("Profiles error:", err),
      );
  }, []);

  useEffect(() => {
    if (currentUser === null) router.replace("/");
  }, [currentUser]);

  useEffect(() => {
    const source =
      toImageSource(myProfile?.avatarBase64 ?? null) ||
      toImageSource(currentUser?.photoURL ?? null);
    setAvatarSource(source);
    setAvatarLoading(false);
  }, [myProfile?.avatarBase64, currentUser?.photoURL]);

  useEffect(() => {
    return () => {
      if (typeof commentsUnsubRef.current === "function")
        commentsUnsubRef.current();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted")
        Alert.alert(
          "Permission needed",
          "We need your location to pin reports on the map.",
        );
    })();
  }, []);

  // ── Reports ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return firestore()
      .collection("reports")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          setReports(
            snapshot.docs.flatMap((docSnap) => {
              const d = docSnap.data() as any;
              if (d?.lng == null || d?.lat == null || !d?.description)
                return [];
              const createdAt: Date | null = d.createdAt?.toDate?.() ?? null;
              return [
                {
                  id: docSnap.id,
                  coord: [d.lng as number, d.lat as number],
                  description: String(d.description),
                  category: toCategory(d.category),
                  priority: toPriority(d.priority),
                  status: d.status === "resolved" ? "resolved" : "pending",
                  imageBase64: d.imageBase64 ?? null,
                  userId: d.userId ?? null,
                  userName: d.userName ?? "Unknown user",
                  createdAt,
                  createdAgo: formatTimeAgo(createdAt),
                } as Report,
              ];
            }),
          );
        },
        (err) => console.error("Reports error:", err),
      );
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────
  const displayName =
    myProfile?.displayName ||
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "User");

  const isOwner =
    !!selectedReport &&
    !!currentUser &&
    currentUser.uid === selectedReport.userId;

  const filteredReports = useMemo(() => {
    if (activeFilter === FILTER_ALL) return reports;
    const group = CATEGORY_GROUPS.find((g) => g.group === activeFilter);
    return group
      ? reports.filter((r) => group.items.includes(r.category))
      : reports;
  }, [reports, activeFilter]);

  const jitteredReports = useMemo(
    () => jitterReportsForRender(filteredReports),
    [filteredReports],
  );

  // ── Helpers ──────────────────────────────────────────────────────────────
  const resetForm = () => {
    setDescription("");
    setSelectedCategory(REPORT_CATEGORIES[0]);
    setPriority("Medium");
    setImageUri(null);
    setImageBase64(null);
  };

  const clearComments = () => {
    cleanupComments();
    setComments([]);
    setCommentText("");
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await auth().signOut();
    } finally {
      router.replace("/");
    }
  };

  const handleUserLocationUpdate = (location: any) => {
    try {
      const { longitude, latitude } = location?.coords ?? {};
      if (!longitude || userLocation) return;
      const coord: [number, number] = [longitude, latitude];
      setUserLocation(coord);
      setCameraCenter(coord);
      setCameraZoom(15);
    } catch {
      /* ignore */
    }
  };

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
      setImageBase64(
        asset.base64 ? `data:${mime};base64,${asset.base64}` : null,
      );
    }
  };

  const openReportModal = () => {
    if (!userLocation) {
      Alert.alert(
        "Location not ready",
        "Waiting for GPS fix. Please log out and log in again.",
      );
      return;
    }
    setCameraCenter(userLocation);
    setCameraZoom(18);
    clearComments();
    setSelectedReport(null);
    setIsEditing(false);
    resetForm();
    setIsModalVisible(true);
  };

  const handleSelectReport = (r: Report) => {
    setSelectedReport(r);
    setDescription(r.description);
    setSelectedCategory(r.category);
    setPriority(r.priority ?? "Medium");
    setImageUri(toImageSource(r.imageBase64)?.uri ?? null);
    setImageBase64(r.imageBase64);
    setIsEditing(false);
    setIsModalVisible(true);
    setCameraCenter(r.coord);
    setCameraZoom(18);
    clearComments();
    commentsUnsubRef.current = firestore()
      .collection("reports")
      .doc(r.id)
      .collection("comments")
      .orderBy("createdAt", "asc")
      .onSnapshot(
        (snap) => {
          setComments(
            snap.docs.flatMap((d) => {
              const c = d.data() as any;
              if (!c?.text) return [];
              const createdAt: Date | null = c.createdAt?.toDate?.() ?? null;
              return [
                {
                  id: d.id,
                  text: String(c.text),
                  userId: c.userId ?? null,
                  userName: c.userName ?? "Unknown user",
                  createdAt,
                  createdAgo: formatTimeAgo(createdAt),
                } as Comment,
              ];
            }),
          );
        },
        (err) => console.error("Comments error:", err),
      );
  };

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

    // ── Edit existing report ──
    if (isEditing && selectedReport) {
      try {
        await firestore().collection("reports").doc(selectedReport.id).update({
          description: description.trim(),
          category: selectedCategory,
          priority,
          imageBase64,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });
        setIsEditing(false);
        setSelectedReport((prev) =>
          prev
            ? {
                ...prev,
                description: description.trim(),
                category: selectedCategory,
                priority,
                imageBase64,
              }
            : prev,
        );
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Could not update your report.");
      }
      return;
    }

    // ── Create new report ──
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
        priority,
        status: "pending",
        imageBase64,
        lng,
        lat,
        userId: user.uid,
        userName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      resetForm();
      setIsModalVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not save your report. Please try again.");
    }
  };

  const handleDeleteReport = () => {
    if (!selectedReport) return;
    const user = auth().currentUser;
    if (!user || user.uid !== selectedReport.userId) {
      Alert.alert("Not allowed", "You can only delete your own reports.");
      return;
    }
    Alert.alert("Delete report", "Are you sure?", [
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
            clearComments();
          } catch (e) {
            console.error(e);
            Alert.alert("Error", "Could not delete your report.");
          }
        },
      },
    ]);
  };

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
      console.error(e);
      Alert.alert("Error", "Could not post your comment.");
    }
  };

  const handleStartEditComment = (c: Comment) => {
    const user = auth().currentUser;
    if (!user || user.uid !== c.userId) return;
    setEditingCommentId(c.id);
    setEditingCommentText(c.text);
  };

  const handleSaveEditedComment = async () => {
    if (!selectedReport || !editingCommentId || !editingCommentText.trim())
      return;
    if (!auth().currentUser) return;
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
      console.error(e);
      Alert.alert("Error", "Could not update your comment.");
    }
  };

  const handleDeleteComment = (c: Comment) => {
    if (!selectedReport) return;
    const user = auth().currentUser;
    if (!user || user.uid !== c.userId) {
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
              .doc(c.id)
              .delete();
          } catch (e) {
            console.error(e);
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
    clearComments();
  };

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>
              Citi<Text style={s.brandAccent}>Watch</Text>
            </Text>
            <Text style={s.brandSub}>Bacolod City</Text>
          </View>
          <TouchableOpacity
            style={s.avatarBtn}
            onPress={() => setIsProfileModalVisible(true)}
          >
            {avatarLoading ? (
              <View style={s.avatarFallback}>
                <ActivityIndicator size="small" color={C.primary} />
              </View>
            ) : avatarSource ? (
              <Image
                source={avatarSource}
                style={s.avatarImg}
                resizeMode="cover"
                onError={() => setAvatarLoading(false)}
              />
            ) : (
              <View style={s.avatarFallback}>
                <Text style={s.avatarInitial}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filterRow}
          contentContainerStyle={s.filterContent}
        >
          {FILTERS.map((opt) => {
            const isActive = activeFilter === opt.value;
            const color =
              opt.value !== FILTER_ALL
                ? (GROUP_COLOR[opt.value] ?? C.primary)
                : C.primary;
            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  s.chip,
                  isActive && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => setActiveFilter(opt.value)}
                activeOpacity={0.75}
              >
                <Text style={s.chipEmoji}>{opt.emoji}</Text>
                <Text style={[s.chipLabel, isActive && s.chipLabelActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Map */}
        <View style={s.mapWrap}>
          <Mapbox.MapView
            key={mapKey}
            style={s.map}
            styleURL={Mapbox.StyleURL.Street}
          >
            <Mapbox.Camera
              centerCoordinate={cameraCenter ?? userLocation ?? DEFAULT_CENTER}
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
                <View style={s.pin}>
                  <Text style={s.pinEmoji}>{getEmoji(r.category)}</Text>
                </View>
                <Mapbox.Callout title={`${r.category} — ${r.userName}`} />
              </Mapbox.PointAnnotation>
            ))}
          </Mapbox.MapView>
        </View>

        {/* FAB */}
        <View style={[s.fabWrap, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity
            style={s.fab}
            onPress={openReportModal}
            activeOpacity={0.85}
          >
            <Text style={s.fabIcon}>＋</Text>
            <Text style={s.fabLabel}>File a Report</Text>
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
          style={s.overlay}
          activeOpacity={1}
          onPressOut={() => setIsProfileModalVisible(false)}
        >
          <View style={s.profileCard}>
            {avatarSource ? (
              <Image
                source={avatarSource}
                style={s.profileAvatar}
                resizeMode="cover"
              />
            ) : (
              <View style={s.avatarFallbackBig}>
                <Text style={s.avatarInitialBig}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={s.profileName}>{displayName}</Text>
            {currentUser?.email && (
              <Text style={s.profileEmail}>{currentUser.email}</Text>
            )}
            <TouchableOpacity
              style={s.logoutBtn}
              onPress={() => {
                setIsProfileModalVisible(false);
                handleLogout();
              }}
            >
              <Text style={s.logoutLabel}>Log out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Stepper modal (create / edit) */}
      <StepperModal
        visible={isModalVisible && (selectedReport === null || isEditing)}
        isEditing={isEditing}
        selectedReport={selectedReport}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        priority={priority}
        setPriority={setPriority}
        description={description}
        setDescription={setDescription}
        imageUri={imageUri}
        imageBase64={imageBase64}
        onPickImage={handlePickImage}
        onSave={handleSaveReport}
        onCancel={handleCancel}
        onStopEditing={() => setIsEditing(false)}
      />

      {/* View Report modal */}
      <ReportModal
        visible={isModalVisible && selectedReport !== null && !isEditing}
        selectedReport={selectedReport}
        isOwner={isOwner}
        comments={comments}
        commentText={commentText}
        setCommentText={setCommentText}
        editingCommentId={editingCommentId}
        editingCommentText={editingCommentText}
        setEditingCommentText={setEditingCommentText}
        currentUserId={currentUser?.uid ?? null}
        onEdit={() => setIsEditing(true)}
        onDelete={handleDeleteReport}
        onAddComment={handleAddComment}
        onStartEditComment={handleStartEditComment}
        onSaveEditedComment={handleSaveEditedComment}
        onDeleteComment={handleDeleteComment}
        onCancelEditComment={() => {
          setEditingCommentId(null);
          setEditingCommentText("");
        }}
        onClose={handleCancel}
      />
    </SafeAreaView>
  );
}

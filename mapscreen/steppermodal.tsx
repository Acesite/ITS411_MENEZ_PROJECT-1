// mapscreen/StepperModal.tsx
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CATEGORY_DEPT,
  CATEGORY_EMOJI,
  CATEGORY_GROUPS,
  GROUP_COLOR,
  PRIORITY_CONFIG,
  PRIORITY_LEVELS
} from "./constants";
import type { Report, ReportCategory, ReportPriority } from "./types";

const getEmoji = (cat: string) => CATEGORY_EMOJI[cat as ReportCategory] ?? "📍";
const getDept = (cat: string) =>
  CATEGORY_DEPT[cat as ReportCategory] ?? "City Government of Bacolod";

// ── Shared nav buttons ────────────────────────────────────────────────────────
function NavButtons({
  backLabel,
  backAction,
  nextLabel,
  nextAction,
  nextDisabled,
}: {
  backLabel: string;
  backAction: () => void;
  nextLabel: string;
  nextAction: () => void;
  nextDisabled: boolean;
}) {
  return (
    <View style={sr.btnRow}>
      <TouchableOpacity style={[sr.btn, sr.btnCancel]} onPress={backAction}>
        <Text style={sr.btnCancelText}>{backLabel}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[sr.btn, sr.btnPrimary, nextDisabled && sr.btnDisabled]}
        onPress={nextAction}
        disabled={nextDisabled}
      >
        <Text style={sr.btnPrimaryText}>{nextLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ step }: { step: number }) {
  const color = (n: number) =>
    n < step ? "#059669" : n === step ? "#1A6BF5" : "#CBD5E0";

  const Circle = ({ n }: { n: number }) => (
    <View style={[sr.stepCircle, { backgroundColor: color(n) }]}>
      <Text style={sr.stepCircleText}>{n < step ? "✓" : String(n)}</Text>
    </View>
  );
  const Line = ({ n }: { n: number }) => (
    <View
      style={[
        sr.stepLine,
        { backgroundColor: n < step ? "#059669" : "#E2E8F0" },
      ]}
    />
  );

  return (
    <>
      <View style={sr.stepRow}>
        <Circle n={1} />
        <Line n={1} />
        <Circle n={2} />
        <Line n={2} />
        <Circle n={3} />
      </View>
      <View style={sr.stepLabels}>
        {["Category", "Photo", "Details"].map((l) => (
          <Text key={l} style={sr.stepLabelText}>
            {l}
          </Text>
        ))}
      </View>
    </>
  );
}

// ── Priority selector ─────────────────────────────────────────────────────────
function PrioritySelector({
  priority,
  setPriority,
}: {
  priority: ReportPriority;
  setPriority: (p: ReportPriority) => void;
}) {
  return (
    <View style={{ marginTop: 20, marginBottom: 4 }}>
      <Text style={sr.sectionLabel}>PRIORITY LEVEL</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {PRIORITY_LEVELS.map((level) => {
          const cfg = PRIORITY_CONFIG[level];
          const selected = priority === level;
          return (
            <TouchableOpacity
              key={level}
              onPress={() => setPriority(level)}
              activeOpacity={0.75}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 12,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: selected ? cfg.color : "#E2E8F0",
                backgroundColor: selected ? cfg.bg : "#fff",
              }}
            >
              <Text style={{ fontSize: 20 }}>{cfg.emoji}</Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: selected ? "700" : "500",
                  color: selected ? cfg.color : "#64748B",
                  marginTop: 4,
                }}
              >
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Step 1: Category + Priority ───────────────────────────────────────────────
function Step1({
  selectedCategory,
  setSelectedCategory,
  priority,
  setPriority,
  isEditing,
  onCancel,
  onStopEditing,
  onNext,
}: {
  selectedCategory: ReportCategory;
  setSelectedCategory: (c: ReportCategory) => void;
  priority: ReportPriority;
  setPriority: (p: ReportPriority) => void;
  isEditing: boolean;
  onCancel: () => void;
  onStopEditing: () => void;
  onNext: () => void;
}) {
  const [open, setOpen] = useState(false);
  const color = (g: string) => GROUP_COLOR[g] ?? "#1A6BF5";

  return (
    <View>
      <Text style={sr.sectionLabel}>WHAT TYPE OF ISSUE?</Text>

      {/* Dropdown trigger */}
      <TouchableOpacity
        style={[sr.dropBtn, open && sr.dropBtnOpen]}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 18 }}>{getEmoji(selectedCategory)}</Text>
          <Text style={sr.dropBtnText}>{selectedCategory}</Text>
        </View>
        <Text style={sr.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Dropdown list */}
      {open && (
        <ScrollView
          style={sr.dropList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {CATEGORY_GROUPS.map((group) => (
            <View key={group.group}>
              <View
                style={[
                  sr.groupHeader,
                  { borderLeftColor: color(group.group) },
                ]}
              >
                <Text style={{ fontSize: 14 }}>{group.emoji}</Text>
                <Text
                  style={[sr.groupHeaderText, { color: color(group.group) }]}
                >
                  {group.group}
                </Text>
              </View>
              {group.items.map((cat) => {
                const selected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      sr.dropOption,
                      selected && {
                        backgroundColor: color(group.group) + "18",
                      },
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 16, width: 24 }}>
                      {getEmoji(cat)}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          sr.dropOptionText,
                          selected && {
                            color: color(group.group),
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                      <Text style={sr.dropOptionDept}>{getDept(cat)}</Text>
                    </View>
                    {selected && (
                      <Text style={{ color: color(group.group), fontSize: 16 }}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Dept pill — shown when dropdown is closed */}
      {!open && (
        <View style={sr.deptPill}>
          <Text style={sr.deptPillLabel}>HANDLED BY</Text>
          <Text style={sr.deptPillValue}>{getDept(selectedCategory)}</Text>
        </View>
      )}

      {/* Priority selector */}
      <PrioritySelector priority={priority} setPriority={setPriority} />

      <NavButtons
        backLabel="Cancel"
        backAction={isEditing ? onStopEditing : onCancel}
        nextLabel="Next →"
        nextAction={onNext}
        nextDisabled={false}
      />
    </View>
  );
}

// ── Step 2: Photo ─────────────────────────────────────────────────────────────
function Step2({
  imageUri,
  imageBase64,
  onPickImage,
  onBack,
  onNext,
}: {
  imageUri: string | null;
  imageBase64: string | null;
  onPickImage: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <View>
      <Text style={sr.sectionLabel}>PHOTO EVIDENCE (REQUIRED)</Text>
      <TouchableOpacity
        style={sr.photoZone}
        onPress={onPickImage}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <>
            <Image
              source={{ uri: imageUri }}
              style={sr.photoPreview}
              resizeMode="cover"
            />
            <View style={sr.photoChangeOverlay}>
              <Text style={sr.photoChangeText}>📷 Change photo</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 36 }}>📷</Text>
            <Text style={sr.photoZoneLabel}>Tap to attach a photo</Text>
            <Text style={sr.photoZoneSub}>
              A photo is required to submit a report
            </Text>
          </>
        )}
      </TouchableOpacity>
      <NavButtons
        backLabel="← Back"
        backAction={onBack}
        nextLabel="Next →"
        nextAction={onNext}
        nextDisabled={!imageBase64}
      />
    </View>
  );
}

// ── Step 3: Description ───────────────────────────────────────────────────────
function Step3({
  description,
  setDescription,
  selectedCategory,
  priority,
  imageBase64,
  isEditing,
  onBack,
  onSave,
}: {
  description: string;
  setDescription: (d: string) => void;
  selectedCategory: ReportCategory;
  priority: ReportPriority;
  imageBase64: string | null;
  isEditing: boolean;
  onBack: () => void;
  onSave: () => void;
}) {
  const cfg = PRIORITY_CONFIG[priority];

  return (
    <View>
      <Text style={sr.sectionLabel}>DESCRIBE THE ISSUE</Text>
      <TextInput
        style={sr.textArea}
        placeholder="What did you see? How long has it been there? Any safety concern?"
        placeholderTextColor="#A0AECB"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <Text style={sr.charCount}>{description.length} / 500</Text>

      {/* Summary card */}
      <View style={sr.summaryCard}>
        <Text style={sr.summaryTitle}>REPORT SUMMARY</Text>
        <View style={sr.summaryRow}>
          <Text style={sr.summaryEmoji}>{getEmoji(selectedCategory)}</Text>
          <View>
            <Text style={sr.summaryCategory}>{selectedCategory}</Text>
            <Text style={sr.summaryDept}>{getDept(selectedCategory)}</Text>
          </View>
        </View>

        {/* Priority row in summary */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <Text style={{ fontSize: 13 }}>{cfg.emoji}</Text>
          <Text style={{ fontSize: 12, color: cfg.color, fontWeight: "600" }}>
            {priority} Priority
          </Text>
        </View>

        <Text style={sr.summaryLocation}>
          📍 Your current location will be pinned
        </Text>
        {imageBase64 && <Text style={sr.summaryPhoto}>📷 Photo attached</Text>}
      </View>

      <NavButtons
        backLabel="← Back"
        backAction={onBack}
        nextLabel={isEditing ? "Update Report" : "Submit Report"}
        nextAction={onSave}
        nextDisabled={description.trim().length < 5}
      />
    </View>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export interface StepperModalProps {
  visible: boolean;
  isEditing: boolean;
  selectedReport: Report | null;
  selectedCategory: ReportCategory;
  setSelectedCategory: (c: ReportCategory) => void;
  priority: ReportPriority;
  setPriority: (p: ReportPriority) => void;
  description: string;
  setDescription: (d: string) => void;
  imageUri: string | null;
  imageBase64: string | null;
  onPickImage: () => void;
  onSave: () => void;
  onCancel: () => void;
  onStopEditing: () => void;
}

export function StepperModal({
  visible,
  isEditing,
  selectedCategory,
  setSelectedCategory,
  priority,
  setPriority,
  description,
  setDescription,
  imageUri,
  imageBase64,
  onPickImage,
  onSave,
  onCancel,
  onStopEditing,
}: StepperModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (visible) setStep(1);
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={sr.overlay}>
        <View style={sr.card}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <Text style={sr.modalTitle}>
              {isEditing ? "Edit Report" : "File a Report"}
            </Text>
            <StepBar step={step} />

            {step === 1 && (
              <Step1
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                priority={priority}
                setPriority={setPriority}
                isEditing={isEditing}
                onCancel={onCancel}
                onStopEditing={onStopEditing}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Step2
                imageUri={imageUri}
                imageBase64={imageBase64}
                onPickImage={onPickImage}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <Step3
                description={description}
                setDescription={setDescription}
                selectedCategory={selectedCategory}
                priority={priority}
                imageBase64={imageBase64}
                isEditing={isEditing}
                onBack={() => setStep(2)}
                onSave={onSave}
              />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const sr = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4 },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginBottom: 20,
  },
  stepLabelText: { fontSize: 11, color: "#94A3B8", fontWeight: "500" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  dropBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 2,
  },
  dropBtnOpen: {
    borderColor: "#1A6BF5",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropBtnText: { fontSize: 15, color: "#0F172A", fontWeight: "500" },
  chevron: { fontSize: 11, color: "#94A3B8" },

  dropList: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#1A6BF5",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 12,
    maxHeight: 380,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#F8FAFF",
    borderLeftWidth: 3,
  },
  groupHeaderText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  dropOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderTopWidth: 0.5,
    borderTopColor: "#F1F5F9",
  },
  dropOptionText: { fontSize: 14, color: "#1E293B" },
  dropOptionDept: { fontSize: 11, color: "#94A3B8", marginTop: 1 },

  deptPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#EFF6FF",
    borderWidth: 0.5,
    borderColor: "#BFDBFE",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 10,
    marginBottom: 4,
  },
  deptPillLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#60A5FA",
    letterSpacing: 0.5,
  },
  deptPillValue: { fontSize: 12, color: "#1D4ED8", fontWeight: "500" },

  photoZone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E0",
    borderRadius: 14,
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 20,
    gap: 8,
  },
  photoPreview: { width: "100%", height: 200 },
  photoChangeOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 8,
    alignItems: "center",
  },
  photoChangeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  photoZoneLabel: { fontSize: 14, color: "#64748B", fontWeight: "500" },
  photoZoneSub: { fontSize: 12, color: "#94A3B8" },

  textArea: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    minHeight: 110,
    textAlignVertical: "top",
    lineHeight: 22,
  },
  charCount: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: "#F8FAFF",
    borderWidth: 0.5,
    borderColor: "#BFDBFE",
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  summaryEmoji: { fontSize: 24 },
  summaryCategory: { fontSize: 15, fontWeight: "600", color: "#0F172A" },
  summaryDept: { fontSize: 12, color: "#64748B" },
  summaryLocation: { fontSize: 12, color: "#64748B" },
  summaryPhoto: { fontSize: 12, color: "#059669" },

  btnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancel: { backgroundColor: "#F1F5F9", flex: 0.7 },
  btnCancelText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  btnPrimary: { backgroundColor: "#1A6BF5" },
  btnPrimaryText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  btnDisabled: { backgroundColor: "#93C5FD" },
});

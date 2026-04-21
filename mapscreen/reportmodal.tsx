// mapscreen/ReportModal.tsx
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CATEGORY_DEPT, CATEGORY_EMOJI, PRIORITY_CONFIG } from "./constants";
import { toImageSource } from "./helpers";
import { C, s } from "./mapstyles";
import type { Comment, Report, ReportCategory, ReportPriority } from "./types";

const getEmoji = (cat: string) => CATEGORY_EMOJI[cat as ReportCategory] ?? "📍";
const getDept = (cat: string) =>
  CATEGORY_DEPT[cat as ReportCategory] ?? "City Government of Bacolod";

export interface ReportModalProps {
  visible: boolean;
  selectedReport: Report | null;
  isOwner: boolean;
  comments: Comment[];
  commentText: string;
  setCommentText: (t: string) => void;
  editingCommentId: string | null;
  editingCommentText: string;
  setEditingCommentText: (t: string) => void;
  currentUserId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onAddComment: () => void;
  onStartEditComment: (c: Comment) => void;
  onSaveEditedComment: () => void;
  onDeleteComment: (c: Comment) => void;
  onCancelEditComment: () => void;
  onClose: () => void;
}

export function ReportModal({
  visible,
  selectedReport,
  isOwner,
  comments,
  commentText,
  setCommentText,
  editingCommentId,
  editingCommentText,
  setEditingCommentText,
  currentUserId,
  onEdit,
  onDelete,
  onAddComment,
  onStartEditComment,
  onSaveEditedComment,
  onDeleteComment,
  onCancelEditComment,
  onClose,
}: ReportModalProps) {
  const priorityCfg = selectedReport?.priority
    ? PRIORITY_CONFIG[selectedReport.priority as ReportPriority]
    : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.sheetScroll}
          >
            {/* Title row */}
            <View style={s.reportTitleRow}>
              <Text style={s.reportEmoji}>
                {getEmoji(selectedReport?.category ?? "")}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={s.reportCategory}>{selectedReport?.category}</Text>
                <Text style={s.reportMeta}>
                  {selectedReport?.userName} · {selectedReport?.createdAgo}
                </Text>
              </View>
              <View
                style={[
                  s.statusPill,
                  selectedReport?.status === "resolved"
                    ? { backgroundColor: C.successSoft }
                    : { backgroundColor: "#FFF7ED" },
                ]}
              >
                <Text
                  style={[
                    s.statusPillText,
                    selectedReport?.status === "resolved"
                      ? { color: C.success }
                      : { color: "#F97316" },
                  ]}
                >
                  {selectedReport?.status === "resolved"
                    ? "Resolved"
                    : "Pending"}
                </Text>
              </View>
            </View>

            {/* Dept badge */}
            <View style={s.deptBadge}>
              <Text style={s.deptBadgeText}>
                🏛 {getDept(selectedReport?.category ?? "")}
              </Text>
            </View>

            {/* Priority badge */}
            {priorityCfg && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  alignSelf: "flex-start",
                  backgroundColor: priorityCfg.bg,
                  borderRadius: 999,
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  marginTop: 6,
                  borderWidth: 0.5,
                  borderColor: priorityCfg.color + "55",
                }}
              >
                <Text style={{ fontSize: 13 }}>{priorityCfg.emoji}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: priorityCfg.color,
                    fontWeight: "600",
                  }}
                >
                  {selectedReport?.priority} Priority
                </Text>
              </View>
            )}

            {/* Image */}
            {selectedReport?.imageBase64 && (
              <Image
                source={toImageSource(selectedReport.imageBase64)!}
                style={s.reportImg}
                resizeMode="cover"
              />
            )}

            {/* Description */}
            <Text style={s.reportDesc}>{selectedReport?.description}</Text>

            {/* Owner actions */}
            {isOwner && (
              <View style={s.ownerRow}>
                <TouchableOpacity style={s.btnOutline} onPress={onEdit}>
                  <Text style={s.btnOutlineText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnDanger} onPress={onDelete}>
                  <Text style={s.btnDangerText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Comments heading */}
            <Text style={s.commentsHeading}>Comments</Text>

            {comments.length === 0 ? (
              <Text style={s.noComments}>No comments yet.</Text>
            ) : (
              comments.map((c) => {
                const isMyComment =
                  !!currentUserId && currentUserId === c.userId;
                const isEditingThis = editingCommentId === c.id;
                return (
                  <View key={c.id} style={s.commentCard}>
                    <View style={s.commentTop}>
                      <View>
                        <Text style={s.commentAuthor}>{c.userName}</Text>
                        <Text style={s.commentTime}>{c.createdAgo}</Text>
                      </View>
                      {isMyComment && !isEditingThis && (
                        <View style={s.commentActions}>
                          <TouchableOpacity
                            onPress={() => onStartEditComment(c)}
                          >
                            <Text style={s.commentActionEdit}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => onDeleteComment(c)}>
                            <Text style={s.commentActionDelete}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    {isEditingThis ? (
                      <View>
                        <TextInput
                          style={s.commentEditInput}
                          value={editingCommentText}
                          onChangeText={setEditingCommentText}
                          multiline
                        />
                        <View style={s.commentEditBtns}>
                          <TouchableOpacity
                            style={s.btnOutline}
                            onPress={onCancelEditComment}
                          >
                            <Text style={s.btnOutlineText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={s.btnPrimary}
                            onPress={onSaveEditedComment}
                          >
                            <Text style={s.btnPrimaryText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <Text style={s.commentBody}>{c.text}</Text>
                    )}
                  </View>
                );
              })
            )}

            {/* Comment input */}
            <View style={s.commentInputRow}>
              <TextInput
                style={s.commentInput}
                placeholder="Add a comment…"
                placeholderTextColor={C.textLight}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity style={s.sendBtn} onPress={onAddComment}>
                <Text style={s.sendBtnText}>Send</Text>
              </TouchableOpacity>
            </View>

            {/* Close */}
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

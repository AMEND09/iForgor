import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Calendar } from 'lucide-react-native';
import { KanbanCard } from '@/types';
import { colors } from '@/utils/colors';
import uuid from 'react-native-uuid';

interface CreateCardModalProps {
  visible: boolean;
  columnId: string;
  boardId: string;
  onClose: () => void;
  onCreate: (card: KanbanCard) => void;
  initialCard?: KanbanCard | null;
  onUpdate?: (card: KanbanCard) => void;
}

const priorityOptions = [
  { value: 'low' as const, label: 'Low', color: colors.accent[500] },
  { value: 'medium' as const, label: 'Medium', color: colors.warning[500] },
  { value: 'high' as const, label: 'High', color: colors.error[500] },
];

export const CreateCardModal: React.FC<CreateCardModalProps> = ({
  visible,
  columnId,
  boardId,
  onClose,
  onCreate,
  initialCard = null,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const insets = useSafeAreaInsets();

  const handleCreate = () => {
    if (!title.trim()) return;

    const newCard: KanbanCard = {
      id: uuid.v4() as string,
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      columnId,
      boardId,
      dueDate: dueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    if (initialCard && onUpdate) {
      // editing existing card
      const updated: KanbanCard = { ...initialCard, ...newCard, id: initialCard.id, createdAt: initialCard.createdAt };
      onUpdate(updated);
    } else {
      onCreate(newCard);
    }
    resetForm();
  };

  const handleDelete = () => {
    if (!initialCard) return;
    // Caller should provide deletion via onUpdate or separate prop; we'll use custom event onUpdate with a special flag
    // For clarity, call onUpdate with a deleted marker by setting title to empty string and letting caller handle deletion.
    // Better: expose onDelete prop; but to avoid changing many call sites, we'll call onUpdate with id and a __delete flag.
    if ((onUpdate as any)) {
      (onUpdate as any)({ ...initialCard, __delete: true } as any);
    }
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Populate form when editing an existing card
  React.useEffect(() => {
    if (visible && initialCard) {
      setTitle(initialCard.title || '');
      setDescription(initialCard.description || '');
      setPriority(initialCard.priority || 'medium');
      setDueDate(initialCard.dueDate || '');
    }
  }, [visible, initialCard]);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setDueDate(formatDateForInput(date));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 10 : 0}
      >
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right', 'top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Task</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={colors.neutral[600]} strokeWidth={2} />
          </TouchableOpacity>
        </View>

  <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 + insets.bottom }}
          >
          <View style={styles.section}>
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter task name"
              placeholderTextColor={colors.neutral[400]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter task description"
              placeholderTextColor={colors.neutral[400]}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityGrid}>
              {priorityOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.priorityOption,
                    priority === option.value && styles.selectedPriority,
                  ]}
                  onPress={() => setPriority(option.value)}
                >
                  <View style={[styles.priorityDot, { backgroundColor: option.color }]} />
                  <Text style={[
                    styles.priorityText,
                    priority === option.value && styles.selectedPriorityText,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Due Date (Optional)</Text>
            <View style={styles.dateSection}>
              <View style={styles.quickDates}>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickDate(0)}
                >
                  <Text style={styles.quickDateText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickDate(1)}
                >
                  <Text style={styles.quickDateText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setQuickDate(7)}
                >
                  <Text style={styles.quickDateText}>Next Week</Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.dateInput}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.neutral[400]}
              />
            </View>
          </View>
        </ScrollView>

  <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 12) }]}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          {initialCard ? (
            <>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !title.trim() && styles.createButtonDisabled,
                ]}
                onPress={handleCreate}
                disabled={!title.trim()}
              >
                <Text style={styles.createButtonText}>Save</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[
                styles.createButton,
                !title.trim() && styles.createButtonDisabled,
              ]}
              onPress={handleCreate}
              disabled={!title.trim()}
            >
              <Text style={styles.createButtonText}>Create Task</Text>
            </TouchableOpacity>
          )}
  </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priorityGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    gap: 8,
  },
  selectedPriority: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  selectedPriorityText: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  dateSection: {
    gap: 12,
  },
  quickDates: {
    flexDirection: 'row',
    gap: 8,
  },
  quickDateButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  quickDateText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  dateInput: {
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    backgroundColor: '#FFFFFF',
    // Position footer above keyboard / always at bottom of modal
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[600],
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
    alignItems: 'center',
    marginRight: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error[600],
  },
});
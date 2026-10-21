import { reactive, watch, onMounted } from 'vue';
import { useReminderStore } from '../reminder.store';
import debounce from 'lodash/debounce';
import { registerFilterReset } from '@/utils/filterRegistry';

/**
 * useReminder
 * Composable untuk menangani logika filter kompleks modul Pengingat.
 */
const filters = reactive({
  search: '',
  reminder_type: '',     // dropdown: stnk, license_expired, service, dll
  status: '',            // dropdown: active, done, overdue
  due_after: '',         // date-picker: batas bawah
  due_before: ''         // date-picker: batas atas
});

export function useReminder() {
  const reminderStore = useReminderStore();

  const fetchData = async (page = 1, force = false) => {
    if (!force && page === 1 && reminderStore.reminders.length > 0) {
      return;
    }
    const params = {
      page,
      limit: reminderStore.pagination.dataPerPage || 10,
      search: filters.search || undefined,
      reminder_type: filters.reminder_type || undefined,
      status: filters.status || undefined,
      due_after: filters.due_after || undefined,
      due_before: filters.due_before || undefined
    };

    // Bersihkan params yang undefined agar tidak dikirim ke API
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    await reminderStore.fetchReminders(params);
  };

  const debouncedSearch = debounce(() => {
    fetchData(1, true);
  }, 500);

  const handlePageChange = (newPage) => {
    fetchData(newPage, true);
  };

  const resetFilters = () => {
    filters.search = '';
    filters.reminder_type = '';
    filters.status = '';
    filters.due_after = '';
    filters.due_before = '';
    fetchData(1, true);
  };

  watch(() => filters.search, () => {
    debouncedSearch();
  });

  watch([
    () => filters.reminder_type,
    () => filters.status,
    () => filters.due_after,
    () => filters.due_before
  ], () => {
    fetchData(1, true);
  });

  onMounted(async () => {
    fetchData(1);
    await reminderStore.fetchDueToday(); 
  });

  return {
    filters,
    reminderStore,
    fetchData,
    handlePageChange,
    resetFilters
  };
}

registerFilterReset(() => {
  filters.search = '';
  filters.reminder_type = '';
  filters.status = '';
  filters.due_after = '';
  filters.due_before = '';
});

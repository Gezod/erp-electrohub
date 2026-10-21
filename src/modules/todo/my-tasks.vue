<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10">

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center border border-brand-500/20">
            <CheckSquare class="w-6 h-6" />
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">Tugas Saya</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">{{ tasks.length }} total task &bull; {{ doneTasks }} selesai</p>
          </div>
        </div>
        <button @click="openCreateModal()" class="btn-primary">
          <Plus class="w-4 h-4"/> Tambah Task
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="s in miniStats" :key="s.label" class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
          <div class="text-2xl font-black text-gray-800 dark:text-white mb-1">{{ s.count }}</div>
          <div class="text-xs font-bold text-gray-400 uppercase tracking-wide">{{ s.label }}</div>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 mb-6">
        <div class="flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 gap-0.5">
          <button v-for="s in statuses" :key="s.value" @click="filters.status=s.value; load()"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            :class="filters.status===s.value
              ?'bg-white dark:bg-gray-700 text-brand-700 dark:text-brand-300 shadow-sm'
              :'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'">
            {{ s.label }}
          </button>
        </div>

        <select v-model="filters.priority" @change="load()" class="input-base w-auto text-xs font-bold">
          <option value="">Semua Prioritas</option>
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="normal">🔵 Normal</option>
          <option value="low">⚪ Low</option>
        </select>

        <div class="relative flex-1 min-w-[200px]">
          <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input v-model="filters.search" @input="debounceLoad()" type="text" placeholder="Cari task..." class="input-base pl-10 text-xs"/>
        </div>

        <div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
          <button @click="viewMode='list'"
            class="p-2 rounded-lg transition" :class="viewMode==='list'?'bg-white dark:bg-gray-700 shadow-sm text-brand-600':'text-gray-400'">
            <List class="w-4 h-4"/>
          </button>
          <button @click="viewMode='grid'"
            class="p-2 rounded-lg transition" :class="viewMode==='grid'?'bg-white dark:bg-gray-700 shadow-sm text-brand-600':'text-gray-400'">
            <LayoutGrid class="w-4 h-4"/>
          </button>
          <button @click="viewMode='gantt'"
            class="p-2 rounded-lg transition" :class="viewMode==='gantt'?'bg-white dark:bg-gray-700 shadow-sm text-brand-600':'text-gray-400'"
            title="Gantt View">
            <BarChart3 class="w-4 h-4"/>
          </button>
        </div>
      </div>

      <div v-if="reminders.length" class="mb-6 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
            <h3 class="text-sm font-black tracking-tight text-gray-800 dark:text-white uppercase">
              Pengingat Tugas
              <span class="ml-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs dark:bg-orange-500/20 dark:text-orange-400">
                {{ reminders.length }}
              </span>
            </h3>
          </div>
          <button @click="showReminders = !showReminders" class="text-xs font-bold text-brand-600 hover:text-brand-700 transition">
            {{ showReminders ? 'Sembunyikan' : 'Tampilkan' }}
          </button>
        </div>

        <transition name="fade">
          <div v-if="showReminders" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="rem in reminders.slice(0, showAllReminders ? reminders.length : 3)" :key="rem.id"
              class="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-500/30 transition-all duration-300">
              <div class="absolute -right-4 -top-4 w-20 h-20 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-colors"></div>

              <div class="relative z-10 flex flex-col h-full">
                <div class="flex justify-between items-start mb-3">
                  <div class="p-2 rounded-xl shadow-sm" :class="remPriBg(rem.task?.priority)">
                    <Bell class="w-4 h-4" />
                  </div>
                  <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-md animate-pulse"
                    :class="remDueClass(rem.due_date)">
                    {{ remDueLabel(rem.due_date) }}
                  </span>
                </div>

                <div class="flex-1">
                  <h4 class="text-xs font-black text-gray-900 dark:text-white mb-1 line-clamp-1">{{ rem.task?.title || 'Tugas' }}</h4>
                  <p class="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{{ rem.description }}</p>
                </div>

                <div class="mt-3 pt-2.5 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                  <div class="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    <Calendar class="w-3 h-3" />
                    {{ fmtReminder(rem.due_date) }}
                  </div>
                  <div class="flex items-center gap-2">
                    <button @click="handleDismissReminder(rem.id)" class="text-[10px] font-black text-error-500 hover:text-error-600 transition">
                      Hentikan
                    </button>
                    <span class="text-gray-350 dark:text-gray-750 select-none text-[10px] font-light">|</span>
                    <button @click="openDetail({ id: rem.task?.id })" class="text-[10px] font-black text-brand-500 hover:text-brand-600 transition flex items-center gap-0.5">
                      Lihat &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="!showAllReminders && reminders.length > 3" @click="showAllReminders = true"
              class="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
              <div class="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-transform">
                <Plus class="w-5 h-5 text-gray-400" />
              </div>
              <span class="text-xs font-bold text-gray-500">Lihat {{ reminders.length - 3 }} Lainnya</span>
            </div>
          </div>
        </transition>
      </div>

      <div v-if="loading" class="space-y-3">
        <div v-for="i in 5" :key="i" class="h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>
      </div>

      <div v-else-if="viewMode==='list' && tasks.length" class="space-y-2">
        <transition-group name="list-item" tag="div" class="space-y-2">
          <div v-for="task in tasks" :key="task.id"
            class="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-5 py-4 hover:shadow-lg hover:shadow-brand-500/10 hover:border-brand-200 dark:hover:border-brand-800/50 transition-all cursor-pointer"
            @click="openDetail(task)">
            <div class="flex items-center gap-4">
              <button @click.stop="toggleDone(task)"
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                :class="task.status==='done'?'bg-emerald-500 border-emerald-500':'border-gray-300 dark:border-gray-600 hover:border-brand-400'">
                <Check v-if="task.status==='done'" class="w-3 h-3 text-white"/>
              </button>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <p class="text-sm font-semibold text-gray-800 dark:text-white truncate group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors"
                    :class="{'line-through text-gray-400 dark:text-gray-500':task.status==='done'}">
                    {{ task.title }}
                  </p>
                  <Lock v-if="task.is_private" class="w-3 h-3 text-gray-300 shrink-0"/>
                </div>
                <p v-if="task.description" class="text-xs text-gray-400 truncate">{{ task.description }}</p>
              </div>

              <div class="flex items-center gap-3 shrink-0">
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full hidden md:inline" :class="priClass(task.priority)">
                  {{ priIcon(task.priority) }} {{ task.priority }}
                </span>
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full hidden md:inline" :class="stClass(task.status)">
                  {{ stLbl(task.status) }}
                </span>
                <div v-if="task.due_date" class="flex items-center gap-1 text-xs"
                  :class="isOld(task.due_date)?'text-error-500 font-bold':'text-gray-400'">
                  <Calendar class="w-3.5 h-3.5"/>
                  {{ fmt(task.due_date) }}
                </div>
                <div class="flex -space-x-1.5">
                  <div v-for="a in (task.assignees||[]).slice(0,3)" :key="a.id"
                    class="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-900">
                    {{ ini(a.employee?.full_name) }}
                  </div>
                </div>
                <div class="flex items-center gap-2 text-[10px] text-gray-400">
                  <span v-if="task._count?.comments" class="flex items-center gap-0.5"><MessageSquare class="w-3 h-3"/>{{ task._count.comments }}</span>
                  <span v-if="task._count?.checklists" class="flex items-center gap-0.5"><ListChecks class="w-3 h-3"/>{{ task._count.checklists }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <div v-else-if="viewMode==='grid' && tasks.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="task in tasks" :key="task.id"
          class="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-xl hover:shadow-brand-500/10 hover:-translate-y-1 hover:border-brand-200 dark:hover:border-brand-800/50 transition-all cursor-pointer"
          @click="openDetail(task)">
          <div class="flex items-start justify-between mb-3">
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full" :class="priClass(task.priority)">
              {{ priIcon(task.priority) }} {{ task.priority }}
            </span>
            <Lock v-if="task.is_private" class="w-3.5 h-3.5 text-gray-300"/>
          </div>
          <h4 class="text-sm font-bold text-gray-800 dark:text-white mb-1 group-hover:text-brand-700 transition-colors line-clamp-2">{{ task.title }}</h4>
          <p v-if="task.description" class="text-xs text-gray-400 line-clamp-2 mb-3">{{ task.description }}</p>
          <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-800">
            <span class="text-[10px] font-black px-2 py-0.5 rounded-full" :class="stClass(task.status)">{{ stLbl(task.status) }}</span>
            <span v-if="task.due_date" class="text-[10px] flex items-center gap-0.5" :class="isOld(task.due_date)?'text-error-500 font-bold':'text-gray-400'">
              <Calendar class="w-3 h-3"/>{{ fmt(task.due_date) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Gantt View -->
      <div v-else-if="viewMode === 'gantt'" class="min-h-[400px]">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs font-black text-gray-500 uppercase tracking-widest">Skala:</span>
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-0.5">
            <button v-for="gm in ganttModes" :key="gm.value"
              @click="ganttViewMode = gm.value"
              class="px-3 py-1.5 rounded-lg text-xs font-bold transition"
              :class="ganttViewMode === gm.value ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'">{{ gm.label }}</button>
          </div>
        </div>
        <GanttTimeline
          :tasks="tasks"
          :milestones="[]"
          :timeline-range="ganttTimelineRange"
          :view-mode="ganttViewMode"
          @task-selected="(taskId) => openDetail({ id: taskId })"
        />
      </div>

      <div v-else-if="!loading" class="flex flex-col items-center py-24 text-center">
        <div class="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-5">
          <CheckSquare class="w-10 h-10 text-brand-400"/>
        </div>
        <h3 class="text-lg font-bold text-gray-600 dark:text-gray-300 mb-2">Tidak ada task ditemukan</h3>
        <p class="text-sm text-gray-400 mb-6">Coba ubah filter atau buat task baru</p>
        <button @click="openCreateModal()" class="px-6 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition shadow-lg shadow-brand-500/25">
          + Tambah Task Pertama
        </button>
      </div>
    </div>

    <FormModal
      v-model="showForm"
      :title="isEdit ? 'Edit Task' : 'Tambah Task Baru'"
      :is-complete="!!formTask.title.trim()"
      :is-loading="saving"
      :submit-label="isEdit ? 'Simpan Perubahan' : 'Tambah Task'"
      @submit="handleFormSubmit"
    >
      <div class="space-y-4">
              <input v-model="formTask.title" type="text" maxlength="500" placeholder="Judul task..." autofocus
                class="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white text-sm font-medium"/>
              <textarea v-model="formTask.description" rows="2" placeholder="Deskripsi (opsional)..."
                class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white text-sm resize-none"/>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Status -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
                  <select v-model="formTask.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white bg-white">
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <!-- Priority -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Prioritas</label>
                  <div class="grid grid-cols-2 gap-1.5">
                    <button type="button" v-for="p in ['urgent','high','normal','low']" :key="p" @click="formTask.priority=p"
                      class="py-1.5 text-[10px] font-black rounded-lg border transition-all"
                      :class="[formTask.priority===p?'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700':'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-300', priClass(p)]">
                      {{ priIcon(p) }} {{ p }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Due Date -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Due Date</label>
                  <input v-model="formTask.due_date" type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white"/>
                </div>

                <!-- Remind At -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remind At</label>
                  <input v-model="formTask.remind_at" type="datetime-local"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white"/>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Start Date -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Mulai (Gantt)</label>
                  <input v-model="formTask.start_date" type="date"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white"/>
                </div>

                <!-- End Date -->
                <div>
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tanggal Selesai (Gantt)</label>
                  <input v-model="formTask.end_date" type="date"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white"/>
                </div>
              </div>

              <!-- Private checkbox -->
              <div class="flex items-center justify-between py-1">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input v-model="formTask.is_private" type="checkbox" class="w-4 h-4 accent-brand-600 rounded"/>
                  <span class="text-xs font-semibold text-gray-700 dark:text-gray-300">Jadikan Private</span>
                </label>
              </div>

              <!-- Assignee dropdown from store -->
              <div class="relative">
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assignee</label>
                <button type="button" @click="showAssigneeDropdown = !showAssigneeDropdown"
                  class="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-left text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white bg-white flex items-center justify-between transition-all">
                  <span class="truncate text-gray-700 dark:text-gray-300">
                    {{ formTask.assignee_ids.length ? `${formTask.assignee_ids.length} Assignee Terpilih` : 'Pilih Assignee...' }}
                  </span>
                  <span class="text-gray-400 font-bold">&darr;</span>
                </button>
                <div v-if="showAssigneeDropdown" class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-48 overflow-y-auto p-2 space-y-1">
                  <div v-for="emp in assignableEmployees" :key="emp.id"
                    @click="toggleFormAssignee(emp.id)"
                    class="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-850 transition text-xs"
                    :class="formTask.assignee_ids.includes(emp.id) ? 'bg-brand-50/50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-400 font-semibold' : 'text-gray-700 dark:text-gray-300'">
                    <div class="flex items-center gap-2">
                      <div class="w-5 h-5 rounded-full bg-brand-200 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center text-[8px]">
                        {{ ini(emp.full_name) }}
                      </div>
                      <span>{{ emp.full_name }}</span>
                    </div>
                    <div v-if="formTask.assignee_ids.includes(emp.id)" class="text-brand-600 dark:text-brand-400 font-bold">&check;</div>
                  </div>
                  <p v-if="!assignableEmployees.length" class="text-[10px] text-gray-400 p-2 text-center">Tidak ada karyawan yang dapat di-assign</p>
                </div>
              </div>

              <!-- Evidence Link -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evidence Link (URL)</label>
                  <a v-if="formTask.evidence_link" :href="formatExternalLink(formTask.evidence_link)" target="_blank"
                    class="px-2 py-0.5 text-[9px] bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-black rounded hover:bg-brand-200 dark:hover:bg-brand-900/50 transition flex items-center gap-0.5">
                    Open Link &rarr;
                  </a>
                </div>
                <input v-model="formTask.evidence_link" type="url" placeholder="https://..."
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white"/>
              </div>

              <!-- Evidence File -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Evidence File (Max 5MB: PNG, JPG, PDF)</label>
                  <a v-if="formTask.existing_evidence_file_url && formTask.evidence_file !== 'null'" :href="formTask.existing_evidence_file_url" target="_blank"
                    class="px-2 py-0.5 text-[9px] bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-black rounded hover:bg-brand-200 dark:hover:bg-brand-900/50 transition flex items-center gap-0.5">
                    Open Link &rarr;
                  </a>
                </div>
                <div v-if="formTask.existing_evidence_file && formTask.evidence_file !== 'null'" class="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-2">
                  <a v-if="formTask.existing_evidence_file_url" :href="formTask.existing_evidence_file_url" target="_blank" class="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline truncate max-w-[200px]" :title="formTask.existing_evidence_file">
                    {{ formTask.existing_evidence_file }}
                  </a>
                  <span v-else class="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{{ formTask.existing_evidence_file }}</span>
                  <button type="button" @click="clearExistingEvidenceFile" class="text-xs text-error-500 font-bold hover:text-error-700">Hapus File</button>
                </div>
                <div v-else-if="formTask.evidence_file === 'null'" class="flex items-center justify-between p-2.5 bg-error-50 dark:bg-error-950/20 rounded-xl border border-error-200 dark:border-error-900/30 mb-2">
                  <span class="text-xs text-error-600 dark:text-error-400 italic">File lama akan dihapus</span>
                  <button type="button" @click="restoreExistingEvidenceFile" class="text-xs text-brand-600 font-bold hover:text-brand-700">Batalkan</button>
                </div>
                <div v-if="formTask.evidence_file !== 'null'" class="flex items-center gap-2">
                  <input type="file" accept="image/png,image/jpeg,application/pdf" @change="handleEvidenceFileChange"
                    class="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-300"/>
                  <button v-if="formTask.evidence_file && typeof formTask.evidence_file !== 'string'" type="button" @click="removeNewEvidenceFile" class="text-xs text-error-500 font-bold hover:text-error-700 shrink-0">Batal</button>
                </div>
              </div>
      </div>
    </FormModal>

    <transition name="slide">
      <div v-if="selected" class="fixed inset-y-0 right-0 z-[998] w-full max-w-[420px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Task</span>
          <div class="flex items-center gap-2">
            <button @click="openEditModal(selected)" class="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 rounded-xl flex items-center gap-1 transition">
              <Pencil class="w-3.5 h-3.5"/> Edit
            </button>
            <button @click="selected=null" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <h2 class="text-base font-bold text-gray-800 dark:text-white mb-2">{{ selected.title }}</h2>
            <p class="text-sm text-gray-500 leading-relaxed">{{ selected.description||'Tidak ada deskripsi' }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3">
              <div class="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-1.5">Status</div>
              <span class="font-black px-2.5 py-1 rounded-lg" :class="stClass(selected.status)">{{ stLbl(selected.status) }}</span>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3">
              <div class="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-1.5">Prioritas</div>
              <span class="font-black px-2.5 py-1 rounded-lg" :class="priClass(selected.priority)">{{ priIcon(selected.priority) }} {{ selected.priority }}</span>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3 col-span-2">
              <div class="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-1.5">Due Date</div>
              <input type="date" :value="fmtInput(selected.due_date)" @change="doUpdateDueDate($event.target.value)"
                class="w-full bg-transparent border-0 border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-brand-500 outline-none p-0 text-xs text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"
                :class="selected.due_date&&isOld(selected.due_date)?'text-error-500 font-bold':''"/>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3 col-span-1">
              <div class="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-1.5">Tanggal Mulai (Gantt)</div>
              <input type="date" :value="fmtInput(selected.start_date)" @change="doUpdateStartDate($event.target.value)"
                class="w-full bg-transparent border-0 border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-brand-500 outline-none p-0 text-xs text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"/>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3 col-span-1">
              <div class="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-1.5">Tanggal Selesai (Gantt)</div>
              <input type="date" :value="fmtInput(selected.end_date)" @change="doUpdateEndDate($event.target.value)"
                class="w-full bg-transparent border-0 border-b border-dashed border-gray-300 dark:border-gray-600 focus:border-brand-500 outline-none p-0 text-xs text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer"/>
            </div>
          </div>

          <div>
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ubah Status</div>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="s in statuses.slice(1)" :key="s.value" @click="doStatus(s.value)"
                class="py-2.5 text-xs font-bold rounded-xl border transition-all"
                :class="selected.status===s.value
                  ?'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                  :'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-300'">
                {{ s.label }}
              </button>
            </div>
          </div>

          <div>
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Assignee</div>
            <div v-if="selected.assignees?.length" class="flex flex-wrap gap-2 mb-3">
              <div v-for="a in selected.assignees" :key="a.id"
                class="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2 border border-brand-100 dark:border-brand-800/30">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold flex items-center justify-center text-[9px]">{{ ini(a.employee?.full_name) }}</div>
                <span class="text-xs font-medium text-brand-700 dark:text-brand-300">{{ a.employee?.full_name }}</span>
                <button @click="removeAssignee(a.employee_id)" class="text-error-400 hover:text-error-600 ml-1">&times;</button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic mb-3">Belum ada assignee</p>
            <div class="mt-2">
              <select v-model="newAssignee" @change="addAssignee" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white">
                <option value="">+ Tambah Assignee...</option>
                <option v-for="emp in availableToAssign" :key="emp.id" :value="emp.id">
                  {{ emp.full_name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Evidence / Bukti Tugas Section -->
          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Bukti Tugas (Evidence)</span>
              <span v-if="existingEvidenceFileName || detailEvidenceLink" class="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px] font-bold">Ada Bukti ✓</span>
            </div>
            
            <div class="space-y-3">
              <!-- Link Evidence Input -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Evidence Link (URL)</label>
                  <a v-if="detailEvidenceLink" :href="formatExternalLink(detailEvidenceLink)" target="_blank"
                    class="px-2 py-0.5 text-[9px] bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-black rounded hover:bg-brand-200 dark:hover:bg-brand-900/50 transition flex items-center gap-0.5">
                    Open Link &rarr;
                  </a>
                </div>
                <input v-model="detailEvidenceLink" type="url" placeholder="https://..."
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-800 dark:text-white bg-transparent"/>
              </div>

              <!-- File Evidence Input / Display -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Evidence File (Max 5MB: PNG, JPG, PDF)</label>
                  <a v-if="existingEvidenceFileUrl && !detailEvidenceFileCleared" :href="existingEvidenceFileUrl" target="_blank"
                    class="px-2 py-0.5 text-[9px] bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-black rounded hover:bg-brand-200 dark:hover:bg-brand-900/50 transition flex items-center gap-0.5">
                    Open Link &rarr;
                  </a>
                </div>
                
                <!-- Existing file layout -->
                <div v-if="existingEvidenceFileName && !detailEvidenceFileCleared" class="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 mb-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <div class="w-8 h-8 rounded bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-brand-500">
                      <Paperclip class="w-4 h-4" />
                    </div>
                    <a v-if="existingEvidenceFileUrl" :href="existingEvidenceFileUrl" target="_blank" class="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline truncate max-w-[180px]" :title="existingEvidenceFileName">
                      {{ existingEvidenceFileName }}
                    </a>
                    <span v-else class="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[180px] font-medium" :title="existingEvidenceFileName">
                      {{ existingEvidenceFileName }}
                    </span>
                  </div>
                  <button type="button" @click="clearDetailEvidenceFile" class="text-[10px] text-error-500 font-bold hover:text-error-700 transition">Hapus</button>
                </div>
                
                <!-- If existing file is cleared -->
                <div v-else-if="detailEvidenceFileCleared" class="flex items-center justify-between p-2.5 bg-error-50 dark:bg-error-950/20 rounded-xl border border-error-200 dark:border-error-900/30 mb-2">
                  <span class="text-[11px] text-error-600 dark:text-error-400 italic">File lama akan dihapus</span>
                  <button type="button" @click="restoreDetailEvidenceFile" class="text-[10px] text-brand-600 font-bold hover:text-brand-700 transition">Batal</button>
                </div>
                
                <!-- Upload new file input -->
                <div v-if="!existingEvidenceFileName || detailEvidenceFileCleared" class="flex items-center gap-2">
                  <input type="file" accept="image/png,image/jpeg,application/pdf" @change="handleDetailEvidenceFileChange"
                    class="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-300"/>
                  <button v-if="detailEvidenceFile" type="button" @click="removeDetailNewEvidenceFile" class="text-[10px] text-error-500 font-bold hover:text-error-700 shrink-0 transition">Batal</button>
                </div>
                
                <!-- If new file is selected, show its name -->
                <div v-if="detailEvidenceFile" class="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span>✓ File terpilih: {{ detailEvidenceFile.name }}</span>
                </div>
              </div>

              <!-- Save button, appears only if dirty -->
              <div v-if="isDetailEvidenceDirty" class="flex justify-end pt-1">
                <button @click="saveDetailEvidence" :disabled="savingDetailEvidence"
                  class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-brand-500/20">
                  <span v-if="savingDetailEvidence">Menyimpan...</span>
                  <span v-else>Simpan Bukti</span>
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Komentar</span>
              <span class="bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded text-[9px]">{{ selected.comments?.length||0 }}</span>
            </div>
            
            <div class="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
              <div v-for="c in selected.comments" :key="c.id" class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-bold text-xs text-gray-800 dark:text-gray-200">{{ c.author?.full_name || 'User' }}</span>
                  <span class="text-[9px] text-gray-400">{{ fmt(c.created_at) }}</span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{{ c.content }}</p>
              </div>
              <div v-if="!selected.comments?.length" class="text-xs text-center text-gray-400 italic py-2">Belum ada komentar</div>
            </div>

            <!-- List of historical attachments/files if any -->
            <div v-if="selected.attachments?.length" class="mb-4">
              <div class="text-[9px] font-bold text-gray-400 uppercase mb-2">Lampiran Bukti Historis:</div>
              <div class="grid grid-cols-2 gap-2">
                <a v-for="a in selected.attachments" :key="a.id" :href="a.file_url" target="_blank"
                  class="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-600 bg-white dark:bg-gray-800 transition group">
                  <div class="w-8 h-8 rounded bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition text-brand-500">
                    <Link2 v-if="a.mime_type==='url'" class="w-4 h-4" />
                    <Paperclip v-else class="w-4 h-4" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[10px] font-bold text-gray-700 dark:text-gray-300 truncate">{{ a.file_name }}</p>
                    <p v-if="a.file_size_kb" class="text-[9px] text-gray-400">{{ a.file_size_kb }} KB</p>
                  </div>
                </a>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 focus-within:border-brand-500 transition-colors shadow-sm relative">
              <textarea v-model="commentText" placeholder="Tulis komentar..." rows="2"
                class="w-full bg-transparent text-xs text-gray-800 dark:text-gray-200 outline-none resize-none mb-2"></textarea>
              
              <div class="flex items-center justify-end">
                <button @click="submitComment" :disabled="submittingComment"
                  class="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ submittingComment ? 'Mengirim...' : 'Kirim' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex justify-end">
          <button @click="handleDelete(selected.id)" class="w-full py-2.5 bg-error-50 hover:bg-error-100 dark:bg-error-950/20 dark:hover:bg-error-950/40 text-error-600 dark:text-error-400 border border-error-100 dark:border-error-900/30 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5">
            <Trash2 class="h-4 w-4" />
            Hapus Task
          </button>
        </div>
      </div>
    </transition>
    <div v-if="selected" @click="selected=null" class="fixed inset-0 z-[997] bg-black/20 backdrop-blur-[1px]"/>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useTodoStore } from './todo.store'
import { Alert } from '@/plugins/sweetalert'
import { Plus, Search, Calendar, MessageSquare, ListChecks, Check, Lock, List, LayoutGrid, CheckSquare, Bell, Pencil, BarChart3, Link2, Paperclip, Trash2 } from 'lucide-vue-next'
import dayjs from 'dayjs'
import GanttTimeline from './GanttTimeline.vue'

const store = useTodoStore()
const tasks = ref([])
const loading = ref(false)
const showForm = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const selected = ref(null)
const viewMode = ref('list')

// -- Gantt view state --
const ganttViewMode = ref('month')
const ganttModes = [
  { value: 'week', label: 'Minggu' },
  { value: 'month', label: 'Bulan' },
  { value: 'quarter', label: 'Kuartal' },
]
const ganttTimelineRange = computed(() => {
  const withDates = tasks.value.filter(t => t.start_date || t.due_date)
  if (!withDates.length) {
    return { start: dayjs().subtract(7, 'day').toDate(), end: dayjs().add(30, 'day').toDate() }
  }
  const allDates = withDates.flatMap(t => [
    t.start_date ? dayjs(t.start_date).toDate() : null,
    t.due_date ? dayjs(t.due_date).toDate() : null,
  ]).filter(Boolean)
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  return {
    start: dayjs(minDate).subtract(7, 'day').toDate(),
    end: dayjs(maxDate).add(7, 'day').toDate(),
  }
})

const handleGanttUpdateDates = async ({ taskId, start_date, due_date }) => {
  try {
    await store.updateTask(taskId, { start_date, due_date })
    const t = tasks.value.find(t => t.id === taskId)
    if (t) {
      if (start_date !== undefined) t.start_date = start_date
      if (due_date !== undefined) t.due_date = due_date
    }
  } catch (e) {
    Alert.error(e.response?.data?.message || 'Gagal memperbarui tanggal task')
  }
}
const filters = ref({ status:'', priority:'', search:'' })
const newAssignee = ref('')
const formTask = ref({
  id: null,
  title: '',
  description: '',
  status: 'todo',
  priority: 'normal',
  is_private: false,
  due_date: '',
  remind_at: '',
  evidence_link: '',
  assignee_ids: [],
  evidence_file: null,
  existing_evidence_file: null,
  existing_evidence_file_url: null
})
const showAssigneeDropdown = ref(false)
const reminders = computed(() => store.todoReminders)
const showReminders = ref(true)
const showAllReminders = ref(false)

// -- Detail Evidence states --
const detailEvidenceLink = ref('')
const detailEvidenceFile = ref(null)
const detailEvidenceFileCleared = ref(false)
const savingDetailEvidence = ref(false)

const existingEvidenceFileName = computed(() => {
  if (!selected.value) return null
  const original = selected.value.evidence_file_name || selected.value.evidence_file || (selected.value.attachments?.length ? selected.value.attachments[0].file_name : null)
  if (!original) return null
  
  if (/^https?:\/\//i.test(original)) {
    try {
      const url = new URL(original)
      return url.pathname.split('/').pop() || original
    } catch (e) {
      return original.split('/').pop() || original
    }
  }
  return original
})

const existingEvidenceFileUrl = computed(() => {
  if (!selected.value) return null
  const fileField = selected.value.evidence_file || selected.value.evidence_file_name
  if (fileField && /^https?:\/\//i.test(fileField)) {
    return fileField
  }
  return selected.value.evidence_file_url || (selected.value.attachments?.length ? selected.value.attachments[0].file_url : null)
})

const isDetailEvidenceDirty = computed(() => {
  if (!selected.value) return false
  const originalLink = selected.value.evidence_link || ''
  const linkChanged = detailEvidenceLink.value !== originalLink
  
  const originalFile = selected.value.evidence_file_name || (selected.value.attachments?.length ? selected.value.attachments[0].file_name : null)
  
  if (originalFile && detailEvidenceFileCleared.value) return true
  if (detailEvidenceFile.value) return true
  
  return linkChanged
})

watch(selected, (newVal) => {
  if (newVal) {
    detailEvidenceLink.value = newVal.evidence_link || ''
    detailEvidenceFile.value = null
    detailEvidenceFileCleared.value = false
  } else {
    detailEvidenceLink.value = ''
    detailEvidenceFile.value = null
    detailEvidenceFileCleared.value = false
  }
}, { immediate: true })

const handleDetailEvidenceFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      Alert.error('Gagal', 'Ukuran file tidak boleh lebih dari 5MB')
      e.target.value = ''
      return
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      Alert.error('Gagal', 'Tipe file harus PNG, JPG, atau PDF')
      e.target.value = ''
      return
    }
    detailEvidenceFile.value = file
    detailEvidenceFileCleared.value = false
  }
}

const clearDetailEvidenceFile = () => {
  detailEvidenceFileCleared.value = true
  detailEvidenceFile.value = null
}

const restoreDetailEvidenceFile = () => {
  detailEvidenceFileCleared.value = false
}

const removeDetailNewEvidenceFile = () => {
  detailEvidenceFile.value = null
}

const saveDetailEvidence = async () => {
  if (!selected.value) return
  
  savingDetailEvidence.value = true
  try {
    const formData = new FormData()
    formData.append('title', selected.value.title || '')
    formData.append('description', selected.value.description || '')
    formData.append('status', selected.value.status)
    formData.append('priority', selected.value.priority)
    formData.append('is_private', selected.value.is_private ? 'true' : 'false')
    
    if (selected.value.due_date) {
      formData.append('due_date', new Date(selected.value.due_date).toISOString())
    }
    if (selected.value.remind_at) {
      formData.append('remind_at', new Date(selected.value.remind_at).toISOString())
    }
    
    formData.append('evidence_link', detailEvidenceLink.value || '')
    
    const assigneeIds = selected.value.assignees?.map(a => a.employee_id) || []
    if (assigneeIds.length) {
      assigneeIds.forEach(id => {
        formData.append('assignee_ids[]', id)
      })
    } else {
      formData.append('assignee_ids[]', '')
    }
    
    if (detailEvidenceFileCleared.value) {
      formData.append('evidence_file', 'null')
    } else if (detailEvidenceFile.value) {
      formData.append('evidence_file', detailEvidenceFile.value)
    }
    
    await store.updateTask(selected.value.id, formData)
    Alert.success('Bukti tugas berhasil disimpan! ✅')
    
    selected.value = await store.fetchTaskById(selected.value.id)
    await load()
  } catch (e) {
    Alert.error(e.response?.data?.message || 'Gagal menyimpan bukti tugas')
  } finally {
    savingDetailEvidence.value = false
  }
}

const statuses = [
  {value:'', label:'Semua'},
  {value:'todo', label:'To Do'},
  {value:'in_progress', label:'In Progress'},
  {value:'in_review', label:'In Review'},
  {value:'on_hold', label:'On Hold'},
  {value:'done', label:'Done'},
]

const doneTasks = computed(() => tasks.value.filter(t => t.status==='done').length)
const miniStats = computed(() => [
  { label:'Total', count: tasks.value.length },
  { label:'In Progress', count: tasks.value.filter(t=>t.status==='in_progress').length },
  { label:'Urgent', count: tasks.value.filter(t=>t.priority==='urgent').length },
  { label:'Selesai', count: doneTasks.value },
])

const assignableEmployees = computed(() => store.assignable)

const availableToAssign = computed(() => {
  if (!selected.value) return []
  const currentIds = selected.value.assignees?.map(a => a.employee_id) || []
  return (store.assignable || []).filter(e => !currentIds.includes(e.id))
})

const toggleFormAssignee = (id) => {
  const idx = formTask.value.assignee_ids.indexOf(id)
  if (idx > -1) {
    formTask.value.assignee_ids.splice(idx, 1)
  } else {
    formTask.value.assignee_ids.push(id)
  }
}

const handleEvidenceFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      Alert.error('Gagal', 'Ukuran file tidak boleh lebih dari 5MB')
      e.target.value = ''
      return
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      Alert.error('Gagal', 'Tipe file harus PNG, JPG, atau PDF')
      e.target.value = ''
      return
    }
    formTask.value.evidence_file = file
  }
}

const clearExistingEvidenceFile = () => {
  formTask.value.evidence_file = 'null'
}
const restoreExistingEvidenceFile = () => {
  formTask.value.evidence_file = null
}
const removeNewEvidenceFile = () => {
  formTask.value.evidence_file = null
}

const openCreateModal = () => {
  isEdit.value = false
  showAssigneeDropdown.value = false
  formTask.value = {
    id: null,
    title: '',
    description: '',
    status: 'todo',
    priority: 'normal',
    is_private: false,
    due_date: '',
    start_date: '',
    end_date: '',
    remind_at: '',
    evidence_link: '',
    assignee_ids: [],
    evidence_file: null,
    existing_evidence_file: null,
    existing_evidence_file_url: null
  }
  showForm.value = true
}

const openEditModal = (task) => {
  isEdit.value = true
  showAssigneeDropdown.value = false
  
  const fileField = task.evidence_file || task.evidence_file_name
  const defaultFileUrl = task.evidence_file_url || (task.attachments?.length ? task.attachments[0].file_url : null)
  const fileUrl = defaultFileUrl || (fileField && /^https?:\/\//i.test(fileField) ? fileField : null)
  
  let fileName = task.evidence_file_name || task.evidence_file || (task.attachments?.length ? task.attachments[0].file_name : null)
  if (fileName && /^https?:\/\//i.test(fileName)) {
    try {
      fileName = new URL(fileName).pathname.split('/').pop() || fileName
    } catch(e) {
      fileName = fileName.split('/').pop() || fileName
    }
  }

  formTask.value = {
    id: task.id,
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'normal',
    is_private: !!task.is_private,
    due_date: task.due_date ? dayjs(task.due_date).format('YYYY-MM-DDTHH:mm') : '',
    start_date: task.start_date ? dayjs(task.start_date).format('YYYY-MM-DD') : '',
    end_date: task.end_date ? dayjs(task.end_date).format('YYYY-MM-DD') : '',
    remind_at: task.remind_at ? dayjs(task.remind_at).format('YYYY-MM-DDTHH:mm') : '',
    evidence_link: task.evidence_link || '',
    assignee_ids: task.assignees?.map(a => a.employee_id) || [],
    evidence_file: null,
    existing_evidence_file: fileName,
    existing_evidence_file_url: fileUrl
  }
  showForm.value = true
}

const load = async () => {
  loading.value = true
  const p = {}
  if (filters.value.status) p.status = filters.value.status
  if (filters.value.priority) p.priority = filters.value.priority
  if (filters.value.search) p.search = filters.value.search
  p.limit = 200
  
  try {
    const res = await store.fetchTasks(p)
    tasks.value = res.data || []
  } catch (error) {
    console.error("Gagal memuat tugas", error)
  } finally {
    loading.value = false
  }
}

let dTimer = null
const debounceLoad = () => { clearTimeout(dTimer); dTimer = setTimeout(load, 400) }

onMounted(async () => {
  store.fetchAssignableEmployees()
  store.fetchReminders()
  await load()
})

const openDetail = async (t) => { selected.value = await store.fetchTaskById(t.id) }

const handleFormSubmit = async () => {
  if (!formTask.value.title.trim()) return Alert.error('Judul task wajib diisi')
  
  saving.value = true
  try {
    const formData = new FormData()
    formData.append('title', formTask.value.title.trim())
    formData.append('description', formTask.value.description || '')
    formData.append('status', formTask.value.status)
    formData.append('priority', formTask.value.priority)
    formData.append('is_private', formTask.value.is_private ? 'true' : 'false')
    
    if (formTask.value.due_date) {
      formData.append('due_date', new Date(formTask.value.due_date).toISOString())
    } else {
      formData.append('due_date', '')
    }
    
    if (formTask.value.remind_at) {
      formData.append('remind_at', new Date(formTask.value.remind_at).toISOString())
    } else {
      formData.append('remind_at', '')
    }

    if (formTask.value.start_date) {
      formData.append('start_date', new Date(formTask.value.start_date).toISOString())
    } else {
      formData.append('start_date', '')
    }

    if (formTask.value.end_date) {
      formData.append('end_date', new Date(formTask.value.end_date).toISOString())
    } else {
      formData.append('end_date', '')
    }
    
    formData.append('evidence_link', formTask.value.evidence_link || '')
    
    if (formTask.value.assignee_ids && formTask.value.assignee_ids.length) {
      formTask.value.assignee_ids.forEach(id => {
        formData.append('assignee_ids[]', id)
      })
    } else {
      formData.append('assignee_ids[]', '')
    }
    
    if (formTask.value.evidence_file) {
      if (formTask.value.evidence_file === 'null') {
        formData.append('evidence_file', 'null')
      } else {
        formData.append('evidence_file', formTask.value.evidence_file)
      }
    }
    
    if (isEdit.value) {
      await store.updateTask(formTask.value.id, formData)
      Alert.success('Task berhasil diperbarui! ✅')
      if (selected.value?.id === formTask.value.id) {
        selected.value = await store.fetchTaskById(formTask.value.id)
      }
    } else {
      await store.createTask(formData)
      Alert.success('Task ditambahkan! ✅')
    }
    
    showForm.value = false
    await load()
  } catch (e) {
    Alert.error(e.response?.data?.message || `Gagal ${isEdit.value ? 'memperbarui' : 'membuat'} task`)
  } finally {
    saving.value = false
  }
}

const toggleDone = async (task) => {
  const s = task.status === 'done' ? 'todo' : 'done'
  await store.updateTask(task.id, { status: s })
  task.status = s
}

const doStatus = async (status) => {
  if (!selected.value) return
  await store.updateTask(selected.value.id, { status })
  selected.value.status = status
  const t = tasks.value.find(t=>t.id===selected.value.id)
  if (t) t.status = status
}

const addAssignee = async () => {
  if (!newAssignee.value || !selected.value) return
  try {
    const currentIds = selected.value.assignees?.map(a => a.employee_id) || []
    await store.assignTask(selected.value.id, [...currentIds, newAssignee.value])
    selected.value = await store.fetchTaskById(selected.value.id)
    newAssignee.value = ''
    
    const idx = tasks.value.findIndex(t => t.id === selected.value.id)
    if (idx !== -1) tasks.value[idx] = selected.value
  } catch(e) { Alert.error(e.response?.data?.message || 'Gagal assign task') }
}

const removeAssignee = async (empId) => {
  if (!selected.value) return
  try {
    const currentIds = selected.value.assignees?.map(a => a.employee_id) || []
    const newIds = currentIds.filter(id => id !== empId)
    await store.assignTask(selected.value.id, newIds)
    selected.value = await store.fetchTaskById(selected.value.id)
    
    const idx = tasks.value.findIndex(t => t.id === selected.value.id)
    if (idx !== -1) tasks.value[idx] = selected.value
  } catch(e) { Alert.error(e.response?.data?.message || 'Gagal hapus assignee') }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Task?', 'Data task ini akan dihapus secara permanen.')
  if (confirmed) {
    try {
      await store.deleteTask(id)
      selected.value = null
      Alert.success('Berhasil', 'Task berhasil dihapus.')
      await load()
    } catch (e) {
      Alert.error('Gagal', e.response?.data?.message || 'Gagal menghapus task')
    }
  }
}

const doUpdateDueDate = async (val) => {
  if (!selected.value) return
  const due_date = val ? new Date(val).toISOString() : null
  try {
    await store.updateTask(selected.value.id, { due_date })
    selected.value.due_date = due_date
    const t = tasks.value.find(t => t.id === selected.value.id)
    if (t) t.due_date = due_date
  } catch (e) {
    Alert.error('Gagal', e.response?.data?.message || 'Gagal memperbarui due date')
  }
}

const doUpdateStartDate = async (val) => {
  if (!selected.value) return
  const start_date = val ? new Date(val).toISOString() : null
  try {
    await store.updateTask(selected.value.id, { start_date })
    selected.value.start_date = start_date
    const t = tasks.value.find(t => t.id === selected.value.id)
    if (t) t.start_date = start_date
  } catch (e) {
    Alert.error('Gagal', e.response?.data?.message || 'Gagal memperbarui tanggal mulai')
  }
}

const doUpdateEndDate = async (val) => {
  if (!selected.value) return
  const end_date = val ? new Date(val).toISOString() : null
  try {
    await store.updateTask(selected.value.id, { end_date })
    selected.value.end_date = end_date
    const t = tasks.value.find(t => t.id === selected.value.id)
    if (t) t.end_date = end_date
  } catch (e) {
    Alert.error('Gagal', e.response?.data?.message || 'Gagal memperbarui tanggal selesai')
  }
}

const fmtInput = d => d ? dayjs(d).format('YYYY-MM-DD') : ''

const priClass = p => ({urgent:'bg-error-100 text-error-700',high:'bg-orange-100 text-orange-700',normal:'bg-blue-100 text-blue-700',low:'bg-gray-100 text-gray-500'}[p]||'bg-gray-100 text-gray-500')
const priIcon  = p => ({urgent:'🔴',high:'🟠',normal:'🔵',low:'⚪'}[p]||'')
const stClass  = s => ({todo:'bg-gray-100 text-gray-600',in_progress:'bg-blue-100 text-blue-700',in_review:'bg-yellow-100 text-yellow-700',on_hold:'bg-orange-100 text-orange-700',done:'bg-emerald-100 text-emerald-700',cancelled:'bg-error-100 text-error-700'}[s]||'bg-gray-100 text-gray-600')
const stLbl    = s => ({todo:'To Do',in_progress:'In Progress',in_review:'In Review',on_hold:'On Hold',done:'Done',cancelled:'Cancelled'}[s]||s)
const ini      = n => (n||'?').split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)
const fmt      = d => dayjs(d).format('DD MMM YY')
const isOld    = d => dayjs(d).isBefore(dayjs(),'day')

const formatExternalLink = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  return `http://${url}`
}

// -- Reminder helpers --
const fmtReminder = d => d ? dayjs(d).format('DD MMM YYYY') : '-'
const remDueLabel = d => {
  if (!d) return 'Unknown'
  const diff = Math.ceil((new Date(d).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)
  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Besok'
  if (diff < 0) return `Lewat ${Math.abs(diff)}h`
  return `H-${diff}`
}
const remDueClass = d => {
  if (!d) return 'bg-gray-100 text-gray-500'
  const diff = Math.ceil((new Date(d).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)
  if (diff <= 0) return 'bg-error-100 text-error-600 dark:bg-error-500/20 dark:text-error-400'
  if (diff <= 2) return 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'
  return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
}
const remPriBg = p => ({
  urgent: 'bg-error-100 text-error-600 dark:bg-error-500/20 dark:text-error-400',
  high: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400',
  normal: 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400',
  low: 'bg-gray-100 text-gray-500 dark:bg-gray-500/20 dark:text-gray-400'
}[p] || 'bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400')

const handleDismissReminder = async (id) => {
  try {
    await store.dismissReminder(id)
    Alert.success('Berhasil', 'Reminder berhasil dihentikan')
  } catch (error) {
    Alert.error('Gagal', error.response?.data?.message || 'Gagal menghentikan reminder')
  }
}

// -- Comment handlers --
const commentText = ref('')
const submittingComment = ref(false)

const submitComment = async () => {
  if (!commentText.value.trim()) {
    return Alert.error('Gagal', 'Komentar tidak boleh kosong')
  }
  
  submittingComment.value = true
  const formData = new FormData()
  formData.append('content', commentText.value.trim())

  try {
    await store.addComment(selected.value.id, formData)
    selected.value = await store.fetchTaskById(selected.value.id)
    commentText.value = ''
    await load()
  } catch (e) {
    Alert.error('Gagal', e.response?.data?.message || 'Gagal menambahkan komentar')
  } finally {
    submittingComment.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,.fade-leave-active{transition:opacity .25s}
.fade-enter-from,.fade-leave-to{opacity:0}
.slide-enter-active,.slide-leave-active{transition:transform .3s cubic-bezier(.4,0,.2,1)}
.slide-enter-from,.slide-leave-to{transform:translateX(100%)}
.list-item-enter-active{transition:all .2s ease}
.list-item-enter-from{opacity:0;transform:translateY(-8px)}
</style>

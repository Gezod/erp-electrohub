<template>
  <AdminLayout>
    <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">

      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <button @click="$router.push({name:'TodoBoards'})"
            class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 hover:text-brand-600 hover:border-brand-300 flex items-center justify-center transition shrink-0">
            <ArrowLeft class="w-4 h-4"/>
          </button>
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-gray-100 dark:border-gray-800"
            :style="board ? {background:(board.color||'#111827')+'15'} : {}">
            {{ board?.icon || '📋' }}
          </div>
          <div>
            <h2 class="text-2xl font-extrabold text-gray-800 dark:text-white tracking-tight leading-none mb-1">{{ board?.name || '...' }}</h2>
            <p class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-0.5 italic">{{ taskCount }} tasks total</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <router-link v-if="board" :to="{ name: 'TodoGanttChart', params: { id: board.id } }" class="btn-outline">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14h3"/><path d="M7 10h6"/><path d="M12 6h6"/></svg>
            Gantt Chart
          </router-link>
          <button @click="openCreate('todo')" class="btn-primary">
            <Plus class="w-4 h-4"/> Tambah Task
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex gap-5 overflow-x-auto pb-4">
        <div v-for="i in 4" :key="i" class="flex-1 min-w-[270px] h-[70vh] rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse"/>
      </div>

      <!-- Kanban -->
      <div v-else class="flex gap-5 overflow-x-auto pb-4 align-top">
        <div v-for="col in columns" :key="col.id"
          class="flex-1 min-w-[272px] max-w-[310px] flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/50">

          <!-- Column Header -->
          <div class="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full" :class="col.dot"/>
              <span class="text-sm font-bold text-gray-700 dark:text-white">{{ col.name }}</span>
              <span class="min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center"
                :class="col.badge">{{ tasksByStatus(col.id).length }}</span>
            </div>
            <button @click="openCreate(col.id)"
              class="text-gray-400 hover:text-brand-600 p-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition">
              <Plus class="w-4 h-4"/>
            </button>
          </div>

          <!-- Draggable -->
          <draggable :list="tasksByStatus(col.id)" group="tasks" item-key="id"
            class="flex-1 p-3 space-y-2.5 min-h-[100px]" @change="e => onDrop(e, col.id)">
            <template #item="{element: t}">
              <div @click="openDetail(t)"
                class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-lg hover:shadow-brand-500/10 hover:border-brand-200 dark:hover:border-brand-700 transition-all cursor-pointer group relative">

                <!-- Priority chip -->
                <div class="flex items-center justify-between mb-2.5">
                  <span class="text-[10px] font-black px-2 py-0.5 rounded-full" :class="priClass(t.priority)">
                    {{ priIcon(t.priority) }} {{ t.priority }}
                  </span>
                  <Lock v-if="t.is_private" class="w-3 h-3 text-gray-300"/>
                </div>

                <!-- Title -->
                <h4 class="text-sm font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">
                  {{ t.title }}
                </h4>
                <p v-if="t.description" class="text-[11px] text-gray-400 line-clamp-1 mb-3">{{ t.description }}</p>

                <!-- Checklist progress -->
                <div v-if="t._count?.checklists" class="mb-3">
                  <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>Checklist</span><span>{{ t._count.checklists }}</span>
                  </div>
                  <div class="h-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    <div class="h-full bg-brand-500 rounded-full" style="width:40%"/>
                  </div>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-2.5 border-t border-gray-50 dark:border-gray-700">
                  <div class="flex -space-x-1.5">
                    <div v-for="a in (t.assignees||[]).slice(0,3)" :key="a.id"
                      class="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-gray-800"
                      :title="a.employee?.full_name">{{ ini(a.employee?.full_name) }}</div>
                    <div v-if="!t.assignees?.length" class="text-[10px] text-gray-300 italic self-center">-</div>
                  </div>
                  <div class="flex items-center gap-2.5 text-[10px] text-gray-400">
                    <span v-if="t._count?.comments" class="flex items-center gap-0.5">
                      <MessageSquare class="w-3 h-3"/>{{ t._count.comments }}
                    </span>
                    <span v-if="t.due_date" class="flex items-center gap-0.5"
                      :class="isOld(t.due_date)?'text-error-500 font-bold':''">
                      <Calendar class="w-3 h-3"/>{{ fmt(t.due_date) }}
                    </span>
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <!-- Add shortcut -->
          <button @click="openCreate(col.id)"
            class="m-3 mt-0 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 border border-dashed border-gray-200 dark:border-gray-700 hover:border-brand-300 transition-all flex items-center justify-center gap-1.5">
            <Plus class="w-3.5 h-3.5"/> Tambah task
          </button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <FormModal
      v-model="showCreate"
      title="Tambah Task Baru"
      :is-complete="!!newTask.title.trim()"
      :is-loading="saving"
      submit-label="Tambah Task"
      @submit="handleCreate"
    >
      <div class="space-y-4">
        <div>
          <label class="section-label">Judul Task *</label>
          <input v-model="newTask.title" type="text" placeholder="Apa yang perlu dikerjakan?" autofocus class="input-base mt-1.5"/>
        </div>
        <div>
          <label class="section-label">Deskripsi</label>
          <textarea v-model="newTask.description" rows="2" class="input-base !h-auto resize-none p-3 mt-1.5"/>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="section-label">Status</label>
            <select v-model="newTask.status" class="input-base mt-1.5 text-xs">
              <option v-for="c in columns" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="section-label">Prioritas</label>
            <select v-model="newTask.priority" class="input-base mt-1.5 text-xs">
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="normal">🔵 Normal</option>
              <option value="low">⚪ Low</option>
            </select>
          </div>
          <div>
            <label class="section-label">Due Date</label>
            <input v-model="newTask.due_date" type="date" class="input-base mt-1.5 text-xs"/>
          </div>
        </div>
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="newTask.is_private" type="checkbox" class="w-4 h-4 accent-brand-600 rounded"/>
          <span class="text-sm text-gray-500 dark:text-gray-400">Private — hanya saya yang bisa lihat</span>
        </label>
        <div>
          <label class="section-label">Assign Ke</label>
          <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl mt-1.5">
            <label v-for="emp in assignableEmps" :key="emp.id" class="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-lg cursor-pointer border border-transparent hover:border-brand-300 transition-all text-xs" :class="newTask.assignee_ids.includes(emp.id) ? 'border-brand-500 bg-brand-50 text-brand-700' : ''">
              <input type="checkbox" :value="emp.id" v-model="newTask.assignee_ids" class="hidden"/>
              <div class="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-[8px]">{{ ini(emp.full_name) }}</div>
              <span>{{ emp.full_name }} <span v-if="emp.position?.name" class="opacity-50">({{ emp.position.name }})</span></span>
            </label>
            <p v-if="!assignableEmps.length" class="text-xs text-gray-400 p-2">Tidak ada bawahan yang bisa di-assign</p>
          </div>
        </div>
      </div>
    </FormModal>

    <!-- Detail Drawer -->
    <transition name="slide">
      <div v-if="selected" class="fixed inset-y-0 right-0 z-[998] w-full max-w-[420px] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-100 dark:border-gray-800 flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Detail Task</span>
          <div class="flex items-center gap-2">
            <button @click="handleDelete(selected.id)" class="p-1.5 rounded-lg text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition">
              <Trash2 class="w-4 h-4"/>
            </button>
            <button @click="selected=null" class="text-gray-400 hover:text-gray-600 text-xl font-bold w-7 h-7 flex items-center justify-center">&times;</button>
          </div>
        </div>
        <div class="flex-1 overflow-y-auto">
          <!-- Task title area -->
          <div class="px-6 py-5 border-b border-gray-50 dark:border-gray-800">
            <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-2 leading-snug">{{ selected.title }}</h2>
            <p class="text-sm text-gray-500 leading-relaxed">{{ selected.description || 'Tidak ada deskripsi.' }}</p>
          </div>

          <!-- Meta Grid -->
          <div class="px-6 py-4 grid grid-cols-2 gap-3 border-b border-gray-50 dark:border-gray-800">
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3">
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Status</div>
              <span class="text-xs font-black px-2.5 py-1 rounded-lg" :class="stClass(selected.status)">{{ stLbl(selected.status) }}</span>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3">
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Prioritas</div>
              <span class="text-xs font-black px-2.5 py-1 rounded-lg" :class="priClass(selected.priority)">{{ priIcon(selected.priority) }} {{ selected.priority }}</span>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3">
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Due Date</div>
              <div class="text-xs font-semibold" :class="selected.due_date && isOld(selected.due_date) ? 'text-error-500' : 'text-gray-700 dark:text-gray-300'">
                {{ selected.due_date ? fmt(selected.due_date) : 'Tidak ada' }}
              </div>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3">
              <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Dibuat Oleh</div>
              <div class="text-xs font-semibold text-gray-700 dark:text-gray-300">{{ selected.creator?.full_name || '-' }}</div>
            </div>
          </div>

          <!-- Change Status -->
          <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Ubah Status</div>
            <div class="grid grid-cols-2 gap-2">
              <button v-for="c in columns" :key="c.id" @click="doChangeStatus(c.id)"
                class="py-2.5 text-xs font-bold rounded-xl border transition-all"
                :class="selected.status===c.id
                  ?'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 shadow-sm'
                  :'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-brand-300 hover:text-brand-600'">
                {{ c.name }}
              </button>
            </div>
          </div>

          <!-- Assignees -->
          <!-- FIX: v-if dan v-else harus langsung berdekatan sebagai sibling -->
          <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Assignee</div>
            <div v-if="selected.assignees?.length" class="flex flex-wrap gap-2 mb-3">
              <div v-for="a in selected.assignees" :key="a.id"
                class="flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2 border border-brand-100 dark:border-brand-800/30">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold flex items-center justify-center text-[9px]">{{ ini(a.employee?.full_name) }}</div>
                <span class="text-xs font-medium text-brand-700 dark:text-brand-300">{{ a.employee?.full_name }}</span>
                <button @click="removeAssignee(a.employee_id)" class="text-error-400 hover:text-error-600 ml-1">&times;</button>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic mb-3">Belum ada assignee</p>

            <!-- select HARUS di luar blok v-if/v-else -->
            <div class="mt-2">
              <select v-model="newAssignee" @change="addAssignee" class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white">
                <option value="">+ Tambah Assignee...</option>
                <option v-for="emp in availableToAssign" :key="emp.id" :value="emp.id">
                  {{ emp.full_name }} ({{ emp.position?.name || 'Staff' }})
                </option>
              </select>
            </div>
          </div>

          <!-- Sub Tasks -->
          <div v-if="selected.sub_tasks?.length" class="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sub Tasks</div>
            <div class="space-y-2">
              <div v-for="s in selected.sub_tasks" :key="s.id"
                class="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                  :class="s.status==='done'?'bg-emerald-500 border-emerald-500':'border-gray-300 dark:border-gray-600'">
                  <Check v-if="s.status==='done'" class="w-3 h-3 text-white"/>
                </div>
                <span class="text-sm text-gray-700 dark:text-gray-300" :class="{' line-through text-gray-400':s.status==='done'}">{{ s.title }}</span>
              </div>
            </div>
          </div>

          <!-- Activity -->
          <div v-if="selected.activities?.length" class="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Aktivitas Terbaru</div>
            <div class="space-y-3">
              <div v-for="a in selected.activities.slice(0,5)" :key="a.id" class="flex items-start gap-2.5">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                  {{ ini(a.actor?.full_name) }}
                </div>
                <div class="text-xs text-gray-500">
                  <span class="font-semibold text-gray-700 dark:text-gray-300">{{ a.actor?.full_name }}</span>
                  {{ ' ' + a.action.replace(/_/g,' ') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Evidence / Bukti Tugas Section -->
          <div class="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
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
                  class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 dark:bg-gray-850 dark:text-white bg-transparent"/>
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
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
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

          <!-- Komentar Section -->
          <div class="px-6 py-4">
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
                  <div class="w-8 h-8 rounded bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition">
                    <svg v-if="a.mime_type==='url'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
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
      </div>
    </transition>
    <div v-if="selected" @click="selected=null" class="fixed inset-0 z-[997] bg-black/20 backdrop-blur-[1px]"/>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useTodoStore } from './todo.store'
import { Alert } from '@/plugins/sweetalert'
import draggable from 'vuedraggable'
import { ArrowLeft, Plus, Calendar, MessageSquare, Lock, Check, Trash2 } from 'lucide-vue-next'
import dayjs from 'dayjs'

const route = useRoute()
const store = useTodoStore()
const board = ref(null)
const tasks = ref([])
const loading = ref(false)
const showCreate = ref(false)
const saving = ref(false)
const selected = ref(null)
const assignableEmps = ref([])
const newAssignee = ref('')
const newTask = ref({ title:'', description:'', priority:'normal', due_date:'', status:'todo', is_private:false, assignee_ids: [] })

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
    const idx = tasks.value.findIndex(t => t.id === selected.value.id)
    if (idx !== -1) tasks.value[idx] = selected.value
  } catch (e) {
    Alert.error(e.response?.data?.message || 'Gagal menyimpan bukti tugas')
  } finally {
    savingDetailEvidence.value = false
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
    
    const idx = tasks.value.findIndex(t => t.id === selected.value.id)
    if (idx !== -1) tasks.value[idx] = selected.value
  } catch (e) {
    Alert.error('Gagal', e.response?.data?.message || 'Gagal menambahkan komentar')
  } finally {
    submittingComment.value = false
  }
}

const columns = [
  { id:'todo',        name:'To Do',       dot:'bg-gray-400',    badge:'bg-gray-100 text-gray-600' },
  { id:'in_progress', name:'In Progress', dot:'bg-blue-500',    badge:'bg-blue-100 text-blue-700' },
  { id:'in_review',   name:'In Review',   dot:'bg-yellow-400',  badge:'bg-yellow-100 text-yellow-700' },
  { id:'done',        name:'Done',        dot:'bg-emerald-500', badge:'bg-emerald-100 text-emerald-700' },
]

const tasksByStatus = s => tasks.value.filter(t => t.status === s)
const taskCount = computed(() => tasks.value.length)
const availableToAssign = computed(() => {
  if (!selected.value) return []
  const currentIds = selected.value.assignees?.map(a => a.employee_id) || []
  return assignableEmps.value.filter(e => !currentIds.includes(e.id))
})

onMounted(async () => {
  loading.value = true
  board.value = await store.fetchBoardById(route.params.id)
  assignableEmps.value = await store.fetchAssignableEmployees()
  const res = await store.fetchTasks({ board_id: route.params.id, limit: 500 })
  tasks.value = res.data || []
  loading.value = false
})

const openCreate = (status='todo') => { newTask.value.status = status; showCreate.value = true }

const openDetail = async (t) => {
  const detail = await store.fetchTaskById(t.id)
  selected.value = detail
}

const handleCreate = async () => {
  if (!newTask.value.title.trim()) return Alert.error('Judul task wajib diisi')
  saving.value = true
  try {
    const pl = { ...newTask.value, board_id: route.params.id }
    if (!pl.due_date) pl.due_date = null
    const res = await store.createTask(pl)
    const created = res?.data || res

    if (created?.id && newTask.value.assignee_ids.length > 0) {
      await store.assignTask(created.id, newTask.value.assignee_ids)
      const detail = await store.fetchTaskById(created.id)
      tasks.value.unshift(detail)
    } else if (created?.id) {
      tasks.value.unshift(created)
    }

    showCreate.value = false
    newTask.value = { title:'', description:'', priority:'normal', due_date:'', status:'todo', is_private:false, assignee_ids: [] }
    Alert.success('Task ditambahkan! ✅')
  } catch(e) { Alert.error(e.response?.data?.message||'Gagal membuat task') }
  finally { saving.value = false }
}

const onDrop = async (evt, newStatus) => {
  if (evt.added) {
    const t = evt.added.element
    try { await store.updateTask(t.id, { status: newStatus }); t.status = newStatus }
    catch(e) { console.error(e) }
  }
}

const doChangeStatus = async (status) => {
  if (!selected.value) return
  await store.updateTask(selected.value.id, { status })
  selected.value.status = status
  const t = tasks.value.find(t => t.id === selected.value.id)
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
  } catch(e) {
    Alert.error(e.response?.data?.message || 'Gagal assign task')
  }
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
  } catch(e) {
    Alert.error(e.response?.data?.message || 'Gagal hapus assignee')
  }
}

const handleDelete = async (id) => {
  const confirmed = await Alert.confirm('Hapus Task?', 'Data task ini akan dihapus secara permanen.')
  if (confirmed) {
    try {
      await store.deleteTask(id)
      selected.value = null
      Alert.success('Berhasil', 'Task berhasil dihapus.')
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (e) {
      Alert.error('Gagal', e.response?.data?.message || 'Gagal menghapus task')
    }
  }
}

const priClass = p => ({ urgent:'bg-error-100 text-error-700', high:'bg-orange-100 text-orange-700', normal:'bg-blue-100 text-blue-700', low:'bg-gray-100 text-gray-500' }[p]||'bg-gray-100 text-gray-500')
const priIcon = p => ({ urgent:'🔴', high:'🟠', normal:'🔵', low:'⚪' }[p]||'')
const stClass = s => ({ todo:'bg-gray-100 text-gray-600', in_progress:'bg-blue-100 text-blue-700', in_review:'bg-yellow-100 text-yellow-700', on_hold:'bg-orange-100 text-orange-700', done:'bg-emerald-100 text-emerald-700' }[s]||'bg-gray-100 text-gray-600')
const stLbl  = s => ({ todo:'To Do', in_progress:'In Progress', in_review:'In Review', on_hold:'On Hold', done:'Done', cancelled:'Cancelled' }[s]||s)
const ini    = n  => (n||'?').split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)
const fmt    = d  => dayjs(d).format('DD MMM')
const isOld  = d  => dayjs(d).isBefore(dayjs(),'day')

const formatExternalLink = (url) => {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) {
    return url
  }
  return `http://${url}`
}
</script>

<style scoped>
.slide-enter-active,.slide-leave-active{transition:transform .3s cubic-bezier(.4,0,.2,1)}
.slide-enter-from,.slide-leave-to{transform:translateX(100%)}
</style>
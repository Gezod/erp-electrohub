import { parseThousand } from '@/utils/format'

// Processor cuma di-resolve saat status masuk 'diproses' (lihat request.service.js) — sebelum itu
// processor_employee_id memang NULL di DB, bukan berarti sudah jatuh ke Pool Admin Pusat.
const resolveProcessorName = (apiData) => {
  if (apiData.processor_employee?.full_name) return apiData.processor_employee.full_name
  if (['draft', 'diajukan'].includes(apiData.status)) return 'Belum ditentukan'
  return 'Pool Admin Pusat'
}

export const MarketingRequestMapper = {
  toUIList: (apiData) => {
    if (!apiData) return null
    return {
      id: apiData.id,
      code: apiData.request_code || '-',
      status: apiData.status || 'draft',
      requestType: apiData.request_type || 'barang',
      requesterType: apiData.requester_type || '-',
      requesterLocationName: apiData.requester_location?.location_name || '-',
      requesterName: apiData.requester_employee?.full_name || '-',
      processorName: resolveProcessorName(apiData),
      itemCount: apiData._count?.details || 0,
      dateRequest: apiData.created_at || null,
      createdAt: apiData.created_at || null,
    }
  },

  toUIDetail: (apiData) => {
    if (!apiData) return null
    return {
      id: apiData.id,
      code: apiData.request_code || '-',
      status: apiData.status || 'draft',
      requestType: apiData.request_type || 'barang',
      requesterType: apiData.requester_type || '-',
      requesterLocationId: apiData.requester_location_id || '',
      requesterLocation: apiData.requester_location || null,
      requesterLocationName: apiData.requester_location?.location_name || '-',
      requesterEmployeeId: apiData.requester_employee_id || '',
      requesterEmployee: apiData.requester_employee || null,
      requesterName: apiData.requester_employee?.full_name || '-',
      processorEmployeeId: apiData.processor_employee_id || null,
      processorEmployee: apiData.processor_employee || null,
      processorName: resolveProcessorName(apiData),
      processorLevel: apiData.processor_level || null,
      escalated: !!apiData.escalated,
      purpose: apiData.purpose || '',
      checkedAt: apiData.checked_at || null,
      approver: apiData.approver || null,
      approverName: apiData.approver?.full_name || null,
      approvedAt: apiData.approved_at || null,
      creator: apiData.creator || null,
      creatorName: apiData.creator?.full_name || '-',
      createdAt: apiData.created_at || null,
      purchases: apiData.purchases || [],
      transfers: apiData.transfers || [],
      // Bukti Sebelum/Sesudah — dipakai untuk cek kelengkapan (evidence_before/evidence_after)
      // sebelum pengajuan bisa ditandai selesai (lihat hasRequiredEvidence di request.service.js).
      evidences: (apiData.evidences || []).map((e) => ({
        id: e.id,
        kind: e.kind,
        sourceType: e.source_type,
        fileUrl: e.file_url,
        fileName: e.file_name || null,
        mimeType: e.mime_type || null,
        fileSizeKb: e.file_size_kb != null ? Number(e.file_size_kb) : null,
        notes: e.notes || null,
        uploaderName: e.uploader?.full_name || null,
        createdAt: e.created_at || null,
      })),
      items: (apiData.details || []).map((d) => ({
        id: d.id,
        goodId: d.good_id,
        goodName: d.good?.good_name || d.item_name || '-',
        uomName: d.good?.uom?.name || '',
        tipeBarang: d.good?.tipe_barang || null,
        qtyRequest: Number(d.qty_request) || 0,
        qtyFulfilled: Number(d.qty_fulfilled) || 0,
        stockStatus: d.stock_status || null,
        stockId: d.stock_id || null,
        qtyCurrent: d.stock?.qty_current != null ? Number(d.stock.qty_current) : null,
        description: d.item_name || '',
        nominal: d.nominal != null ? Number(d.nominal) : null,
        notes: d.notes || '',
      })),
    }
  },

  toPayload: (form, items) => {
    const requestType = form.requestType || 'barang'
    return {
      request_type: requestType,
      requester_employee_id: form.requesterEmployeeId || undefined,
      requester_location_id: form.requesterLocationId || undefined,
      purpose: form.purpose || null,
      items: requestType === 'jasa'
        ? items.map((it) => ({
            item_name: it.description,
            nominal: Number(parseThousand(it.nominal)),
            notes: it.notes || null,
          }))
        : items.map((it) => ({ good_id: it.goodId, qty_request: Number(it.qtyRequest), notes: it.notes || null })),
    }
  },
}

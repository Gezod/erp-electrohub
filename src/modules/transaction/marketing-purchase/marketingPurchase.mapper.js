export const MarketingPurchaseMapper = {
  toUIList: (apiData) => {
    if (!apiData) return null
    return {
      id: apiData.id,
      code: apiData.purchase_code || '-',
      status: apiData.status || 'draft',
      sourceType: apiData.source_type || '-',
      vendorName: apiData.vendor_name || '-',
      priceTotal: Number(apiData.price_total) || 0,
      priceFinalTotal: Number(apiData.price_final_total) || 0,
      locationName: apiData.location?.location_name || '-',
      picName: apiData.pic?.full_name || '-',
      requestCode: apiData.request?.request_code || null,
      itemCount: apiData._count?.details || 0,
      createdAt: apiData.created_at || null,
    }
  },

  /**
   * Standardize satu entri Evidence (dokumen pendukung) untuk UI.
   * Sumber: array `evidences` pada detail purchase, atau GET /:id/evidences.
   */
  toUIEvidence: (e) => {
    if (!e) return null
    const mime = e.mime_type || ''
    const url = e.file_url || ''
    const isLink = e.source_type === 'link'

    return {
      id: e.id,
      purchaseId: e.purchase_id || null,
      kind: e.kind, // 'evidence_purchase' | 'evidence_done'
      sourceType: e.source_type || 'file',
      isLink,
      fileUrl: url,
      fileName: e.file_name || MarketingPurchaseMapper.deriveFileLabel(url),
      mimeType: e.mime_type || null,
      fileSizeKb: e.file_size_kb != null ? Number(e.file_size_kb) : null,
      isImage: !isLink && (/^image\//.test(mime) || /\.(jpe?g|png|webp)$/i.test(url)),
      uploadedBy: e.uploaded_by || null,
      uploaderName: e.uploader?.full_name || 'Tidak diketahui',
      notes: e.notes || '',
      createdAt: e.created_at || null,
    }
  },

  /** Label cadangan saat file_name kosong */
  deriveFileLabel: (url) => {
    if (!url) return '(Tanpa nama)'
    try {
      return new URL(url).hostname
    } catch {
      return url.split('/').pop() || '(Tanpa nama)'
    }
  },

  toUIDetail: (apiData) => {
    if (!apiData) return null
    return {
      id: apiData.id,
      code: apiData.purchase_code || '-',
      status: apiData.status || 'draft',
      sourceType: apiData.source_type || 'tanpa_pengajuan',
      purchaseType: apiData.purchase_type || 'barang',
      vendorName: apiData.vendor_name || '',
      datePurchase: apiData.date_purchase ? String(apiData.date_purchase).split('T')[0] : null,
      dateArrive: apiData.date_arrive ? String(apiData.date_arrive).split('T')[0] : null,
      priceTotal: Number(apiData.price_total) || 0,
      priceFinalTotal: Number(apiData.price_final_total) || 0,
      discountType: apiData.discount_type || null,
      discountPercent: Number(apiData.discount_percent) || 0,
      discountNominal: Number(apiData.discount_nominal) || 0,
      shippingCost: Number(apiData.shipping_cost) || 0,
      packagingCost: Number(apiData.packaging_cost) || 0,
      payment: apiData.payment || null,
      paymentMethod: apiData.payment_method || null,
      // Mirror READ-ONLY: backend mengisinya dengan file_url entri TERTUA per kategori.
      // Untuk daftar dokumen yang lengkap, baca `evidences` di bawah.
      evidencePurchase: apiData.evidence_purchase || null,
      evidenceDone: apiData.evidence_done || null,
      // Selalu array agar komponen tidak perlu null-guard
      evidences: (apiData.evidences || []).map(MarketingPurchaseMapper.toUIEvidence).filter(Boolean),
      notes: apiData.notes || '',
      cancelReason: apiData.cancel_reason || '',
      submittedAt: apiData.submitted_at || null,
      approvedAt: apiData.approved_at || null,
      approver: apiData.approver || null,
      approvedABy: apiData.approved_a_by || null,
      approvedAAt: apiData.approved_a_at || null,
      approvedBBy: apiData.approved_b_by || null,
      approvedBAt: apiData.approved_b_at || null,
      approvedAEmp: apiData.approved_a_emp || null,
      approvedBEmp: apiData.approved_b_emp || null,
      receivedAt: apiData.received_at || null,
      completedAt: apiData.completed_at || null,
      cancelledAt: apiData.cancelled_at || null,
      actionResults: apiData.action_results || null,
      locationId: apiData.location_id || '',
      location: apiData.location || null,
      picMarketing: apiData.pic_marketing || '',
      pic: apiData.pic || null,
      requestId: apiData.request_id || null,
      request: apiData.request || null,
      createdAt: apiData.created_at || null,
      items: (apiData.details || []).map((d) => ({
        id: d.id,
        goodId: d.good_id || '',
        itemName: d.item_name || '',
        requestDetailId: d.request_detail_id || null,
        goodName: d.good?.good_name || d.item_name || '-',
        goodCode: d.good?.good_code || '',
        tipeBarang: d.good?.tipe_barang || null,
        uomName: d.good?.uom?.name || '',
        qtyPurchase: Number(d.qty_purchase) || 0,
        qtyAccepted: Number(d.qty_accepted) || 0,
        qtyRefund: Number(d.qty_refund) || 0,
        qtyRetur: Number(d.qty_retur) || 0,
        qtyDefective: Number(d.qty_defective) || 0,
        unitPrice: Number(d.unit_price) || 0,
        subtotal: Number(d.subtotal) || 0,
        refundAmount: Number(d.refund_amount) || 0,
        returAmount: Number(d.retur_amount) || 0,
        unitPriceFinal: Number(d.unit_price_final) || 0,
        subTotalFinal: Number(d.sub_total_final) || 0,
        notes: d.notes || '',
        assets: d.assets || [],
      })),
    }
  },

  toFormData: (form, items = []) => {
    const fd = new FormData()
    fd.append('source_type', form.sourceType || 'tanpa_pengajuan')
    fd.append('purchase_type', form.purchaseType || 'barang')
    if (form.requestId) fd.append('request_id', form.requestId)
    fd.append('location_id', form.locationId)
    fd.append('pic_marketing', form.picMarketing)
    if (form.vendorName) fd.append('vendor_name', form.vendorName)
    if (form.datePurchase) fd.append('date_purchase', form.datePurchase)
    if (form.dateArrive) fd.append('date_arrive', form.dateArrive)
    if (form.payment) fd.append('payment', form.payment)
    if (form.paymentMethod) fd.append('payment_method', form.paymentMethod)
    if (form.notes) fd.append('notes', form.notes)
    const discountType = form.discountType || 'percent'
    fd.append('discount_type', discountType)
    if (discountType === 'nominal') {
      fd.append('discount_percent', 0)
      fd.append('discount_nominal', Number(form.discountNominal) || 0)
    } else {
      const pct = Math.min(100, Math.max(0, Number(form.discountPercent) || 0))
      fd.append('discount_percent', pct)
      fd.append('discount_nominal', 0)
    }
    if (form.shippingCost != null) fd.append('shipping_cost', Number(form.shippingCost))
    if (form.packagingCost != null) fd.append('packaging_cost', Number(form.packagingCost))

    const isNonBarang = (form.purchaseType || 'barang') === 'non_barang'
    const mappedItems = items.map((it) => ({
      good_id: isNonBarang ? null : (it.goodId || null),
      item_name: it.itemName || null,
      qty_purchase: Number(it.qtyPurchase),
      unit_price: Number(it.unitPrice),
      notes: it.notes || null,
      ...(it.requestDetailId ? { request_detail_id: it.requestDetailId } : {}),
    }))
    fd.append('items', JSON.stringify(mappedItems))

    return fd
  },

  /**
   * Bangun FormData untuk POST /marketing/purchases/:id/evidences.
   *
   * Bentuk payload (sisi UI):
   * {
   *   evidence_purchase: {
   *     files: [{ file: File, notes: string }],
   *     links: [{ url: string, fileName: string, notes: string }]
   *   },
   *   evidence_done: { ...idem }
   * }
   *
   * TIGA INVARIAN yang wajib dipatuhi (backend: multer .fields + Zod):
   *  1. Nama field DIULANG untuk tiap file — BUKAN `evidence_purchase[]`.
   *     Bentuk bracket dibalas 400 "Unexpected field".
   *  2. `*_links` dan `*_notes` dikirim sebagai JSON STRING.
   *  3. `*_notes` dipasangkan PER URUTAN dengan file yang di-append, sehingga
   *     panjangnya harus sama persis dengan jumlah file kategori itu.
   */
  toEvidenceFormData: (payload = {}) => {
    const formData = new FormData()

    ;['evidence_purchase', 'evidence_done'].forEach((kind) => {
      const bucket = payload[kind] || {}

      const files = (bucket.files || []).filter((f) => f && f.file)
      files.forEach((entry) => {
        formData.append(kind, entry.file, entry.file.name)
      })
      if (files.length) {
        formData.append(
          `${kind}_notes`,
          JSON.stringify(files.map((f) => (f.notes && f.notes.trim() ? f.notes.trim() : null)))
        )
      }

      const links = (bucket.links || []).filter((l) => l && l.url && l.url.trim())
      if (links.length) {
        formData.append(
          `${kind}_links`,
          JSON.stringify(
            links.map((l) => {
              const item = { url: l.url.trim() }
              if (l.fileName && l.fileName.trim()) item.file_name = l.fileName.trim()
              if (l.notes && l.notes.trim()) item.notes = l.notes.trim()
              return item
            })
          )
        )
      }
    })

    return formData
  },

  /**
   * Guard agar tidak pernah menembak request kosong.
   * Backend membalas 400 "Tidak ada dokumen pendukung yang dikirim".
   */
  hasEvidencePayload: (payload = {}) =>
    ['evidence_purchase', 'evidence_done'].some((kind) => {
      const bucket = payload[kind] || {}
      return (
        (bucket.files || []).some((f) => f && f.file) ||
        (bucket.links || []).some((l) => l && l.url && l.url.trim())
      )
    }),
}

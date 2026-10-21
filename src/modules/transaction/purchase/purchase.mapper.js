/**
 * PurchaseMapper
 * Transforms data between Purchase API structure and UI needs.
 */
export const PurchaseMapper = {
  /** Standardize purchase object for table list */
  toUIList: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      code: apiData.purchase_code || '-',
      status: apiData.status || 'draft',
      sourceType: apiData.source_type || '-',
      purchaseType: apiData.purchase_type || '-',
      tipe: apiData.tipe || 'biasa',
      isStokOpening: apiData.tipe === 'opening',
      vendorName: apiData.vendor_name || '-',
      priceTotal: Number(apiData.price_total) || 0,
      priceFinalTotal: Number(apiData.price_final_total) || 0,
      payment: apiData.payment || '-',
      locationName: apiData.location?.location_name || '-',
      picGaName: apiData.ga_pic?.full_name || '-',
      requestCode: apiData.request?.code_request || '-',
      evidenceCount: apiData._count?.evidences || 0,
      createdAt: apiData.created_at || null,
      completedAt: apiData.completed_at || null,
    };
  },

  /**
   * Standardize satu entri Evidence (dokumen pendukung) untuk UI.
   * Sumber: array `evidences` pada detail purchase, atau GET /:id/evidences.
   */
  toUIEvidence: (e) => {
    if (!e) return null;
    const mime = e.mime_type || '';
    const url = e.file_url || '';
    const isLink = e.source_type === 'link';

    return {
      id: e.id,
      purchaseId: e.purchase_id || null,
      kind: e.kind,                                   // 'evidence_purchase' | 'evidence_done'
      sourceType: e.source_type || 'file',            // 'file' | 'link'
      isLink,
      fileUrl: url,
      // Entri link sering tidak punya file_name — pakai hostname sebagai label
      fileName: e.file_name || PurchaseMapper.deriveFileLabel(url),
      mimeType: e.mime_type || null,
      fileSizeKb: e.file_size_kb != null ? Number(e.file_size_kb) : null,
      isImage: !isLink && (/^image\//.test(mime) || /\.(jpe?g|png|webp)$/i.test(url)),
      uploadedBy: e.uploaded_by || null,
      uploaderName: e.uploader?.full_name || 'Tidak diketahui',
      notes: e.notes || '',
      createdAt: e.created_at || null,
    };
  },

  /** Label cadangan saat file_name kosong */
  deriveFileLabel: (url) => {
    if (!url) return '(Tanpa nama)';
    try {
      return new URL(url).hostname;
    } catch {
      return url.split('/').pop() || '(Tanpa nama)';
    }
  },

  /** Standardize detailed purchase for form/detail view */
  toUIDetail: (apiData) => {
    if (!apiData) return null;
    return {
      id: apiData.id,
      code: apiData.purchase_code || '-',
      status: apiData.status || 'draft',
      sourceType: apiData.source_type || 'tanpa_tiket',
      purchaseType: apiData.purchase_type || 'barang',
      tipe: apiData.tipe || 'biasa',
      isStokOpening: apiData.tipe === 'opening',
      vendorName: apiData.vendor_name || '',
      priceTotal: Number(apiData.price_total) || 0,
      priceFinalTotal: Number(apiData.price_final_total) || 0,
      payment: apiData.payment || null,
      paymentMethod: apiData.payment_method || null,
      datePurchase: (apiData.date_purchase && typeof apiData.date_purchase === 'string') ? apiData.date_purchase.split('T')[0] : null,
      dateArrive: (apiData.date_arrive && typeof apiData.date_arrive === 'string') ? apiData.date_arrive.split('T')[0] : null,
      // Mirror READ-ONLY: backend mengisinya dengan file_url entri TERTUA per kategori.
      // Untuk daftar dokumen yang lengkap, baca `evidences` di bawah.
      evidencePurchase: apiData.evidence_purchase || null,
      evidenceDone: apiData.evidence_done || null,
      // Selalu array agar komponen tidak perlu null-guard
      evidences: (apiData.evidences || []).map(PurchaseMapper.toUIEvidence).filter(Boolean),
      submittedAt: apiData.submitted_at || null,
      approvedAt: apiData.approved_at || null,
      receivedAt: apiData.received_at || null,
      completedAt: apiData.completed_at || null,
      approvedABy: apiData.approved_a_by || null,
      approvedAAt: apiData.approved_a_at || null,
      approvedANote: apiData.approved_a_note || '',
      approvedBBy: apiData.approved_b_by || null,
      approvedBAt: apiData.approved_b_at || null,
      approvedBNote: apiData.approved_b_note || '',
      approvedAEmp: apiData.approved_a_emp || null,
      approvedBEmp: apiData.approved_b_emp || null,
      locationId: apiData.location_id || '',
      location: apiData.location || null,
      picGaId: apiData.pic_ga || '',
      gaPic: apiData.ga_pic || null,
      requestId: apiData.request_id || null,
      request: apiData.request || null,
      // Dibaca oleh baris "Tiket Ref" di detail.vue — sebelumnya tidak pernah dipetakan
      requestCode: apiData.request?.code_request || null,
      notes: apiData.notes || '',
      cancelReason: apiData.cancel_reason || '',
      discountType: apiData.discount_type || 'percent',
      discountPercent: Number(apiData.discount_percent) || 0,
      discountNominal: Number(apiData.discount_nominal) || 0,
      shippingCost: Number(apiData.shipping_cost) || 0,
      packagingCost: Number(apiData.packaging_cost) || 0,
      refundAmount: Number(apiData.refund_amount) || 0,
      returAmount: Number(apiData.retur_amount) || 0,
      createdAt: apiData.created_at || null,
      // Map details
      items: (apiData.details || []).map(d => ({
        id: d.id,
        goodId: d.good_id || '',
        itemName: d.item_name || d.good?.good_name || '-',
        qtyPurchase: Number(d.qty_purchase) || 0,
        qtyAccepted: Number(d.qty_accepted) || 0,
        qtyRefund: Number(d.qty_refund) || 0,
        qtyRetur: Number(d.qty_retur) || 0,
        qtyDefective: Number(d.qty_defective) || 0,
        refundAmount: Number(d.refund_amount) || 0,
        returAmount: Number(d.retur_amount) || 0,
        unitPrice: Number(d.unit_price) || 0,
        subtotal: Number(d.subtotal) || 0,
        subtotalRaw: Number(d.subtotal_raw) || 0,
        unitPriceFinal: Number(d.unit_price_final) || 0,
        subTotalFinal: Number(d.sub_total_final) || 0,
        notes: d.notes || '',
        good: d.good || null,
        assets: d.assets || []
      })),
      // If there are action results (from status=selesai)
      actionResults: apiData.action_results || null
    };
  },

  /** Map local form state to API FormData (multipart) */
  toFormData: (form, items = []) => {
    const formData = new FormData();

    // Core fields
    formData.append('source_type', form.sourceType);
    formData.append('location_id', form.locationId);

    if (form.requestId) formData.append('request_id', form.requestId);
    if (form.purchaseType) formData.append('purchase_type', form.purchaseType);
    formData.append('tipe', form.purchaseType === 'barang' && form.tipe ? form.tipe : 'biasa');
    if (form.vendorName) formData.append('vendor_name', form.vendorName);
    if (form.datePurchase) formData.append('date_purchase', form.datePurchase);
    if (form.dateArrive) formData.append('date_arrive', form.dateArrive);
    if (form.payment) formData.append('payment', form.payment);
    if (form.paymentMethod) formData.append('payment_method', form.paymentMethod);
    if (form.notes) formData.append('notes', form.notes);
    if (form.picGaId) formData.append('pic_ga', form.picGaId);

    // Financial fields
    const discountType = form.discountType || 'percent';
    formData.append('discount_type', discountType);
    if (discountType === 'nominal') {
      formData.append('discount_percent', 0);
      formData.append('discount_nominal', Number(form.discountNominal) || 0);
    } else {
      const pct = Math.min(100, Math.max(0, Number(form.discountPercent) || 0));
      formData.append('discount_percent', pct);
      formData.append('discount_nominal', 0);
    }
    formData.append('shipping_cost', Number(form.shippingCost) || 0);
    formData.append('packaging_cost', Number(form.packagingCost) || 0);

    // Dokumen pendukung dikelola sepenuhnya lewat POST /:id/evidences (EvidenceManager);
    // form ini tidak lagi mengirim field evidence_* apa pun.

    // Items (as JSON string as per docs)
    if (items.length) {
      const mappedItems = items.map(it => ({
        good_id: it.goodId || null,
        item_name: it.itemName || it.search || '',
        qty_purchase: Number(it.qtyPurchase),
        unit_price: Number(it.unitPrice),
        subtotal_raw: Number(it.subtotalRaw),
        subtotal_discounted: Number(it.subtotalDiscounted),
        notes: it.notes || null
      }));
      formData.append('items', JSON.stringify(mappedItems));
    }

    return formData;
  },

  /**
   * Bangun FormData untuk POST /ga/purchases/:id/evidences.
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
   *  2. `*_links` dan `*_notes` dikirim sebagai JSON STRING. Array mentah yang
   *     di-append ke FormData akan terkoersi menjadi "[object Object]".
   *  3. `*_notes` dipasangkan PER URUTAN dengan file yang di-append, sehingga
   *     panjangnya harus sama persis dengan jumlah file kategori itu. Karena itu
   *     keduanya dibangun dari array hasil filter YANG SAMA di bawah ini.
   *     Jangan pernah mengirim `*_notes` tanpa file.
   */
  toEvidenceFormData: (payload = {}) => {
    const formData = new FormData();

    ['evidence_purchase', 'evidence_done'].forEach((kind) => {
      const bucket = payload[kind] || {};

      // --- File (invarian 1 & 3) ---
      const files = (bucket.files || []).filter((f) => f && f.file);
      files.forEach((entry) => {
        formData.append(kind, entry.file, entry.file.name);
      });
      if (files.length) {
        formData.append(
          `${kind}_notes`,
          JSON.stringify(files.map((f) => (f.notes && f.notes.trim() ? f.notes.trim() : null)))
        );
      }

      // --- Link (invarian 2) ---
      const links = (bucket.links || []).filter((l) => l && l.url && l.url.trim());
      if (links.length) {
        formData.append(
          `${kind}_links`,
          JSON.stringify(
            links.map((l) => {
              const item = { url: l.url.trim() };
              if (l.fileName && l.fileName.trim()) item.file_name = l.fileName.trim();
              if (l.notes && l.notes.trim()) item.notes = l.notes.trim();
              return item;
            })
          )
        );
      }
    });

    return formData;
  },

  /**
   * Guard agar tidak pernah menembak request kosong.
   * Backend membalas 400 "Tidak ada dokumen pendukung yang dikirim".
   */
  hasEvidencePayload: (payload = {}) =>
    ['evidence_purchase', 'evidence_done'].some((kind) => {
      const bucket = payload[kind] || {};
      return (
        (bucket.files || []).some((f) => f && f.file) ||
        (bucket.links || []).some((l) => l && l.url && l.url.trim())
      );
    })
};

let state = {
  currentTemplate: 'tenancy_agreement',
  currentLang: 'bn',
  templates: [],
  formData: {},
  customClauses: [],
  debounceTimer: null,
  lastRefinedClause: null,
  isDirectEdit: false,
  showStamp: true,
  currentContractId: null,
  sigTarget: 'p1',
  isDrawing: false,
  watermarkMode: 'none', // 'none' | 'draft' | 'confidential'
  currentDocHash: ''
};

function getVaultSessionId() {
  let vid = localStorage.getItem('smartlegal_vault_id');
  if (!vid) {
    const randPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
    vid = 'usr_' + randPart;
    localStorage.setItem('smartlegal_vault_id', vid);
  }
  return vid;
}

const formDefinitions = {
  tenancy_agreement: {
    step1: [
      { id: 'execution_date', label: 'চুক্তির তারিখ / Execution Date', type: 'text' },
      { id: 'landlord_name', label: '১ম পক্ষ: বাড়িওয়ালার নাম', type: 'text' },
      { id: 'landlord_father', label: 'বাড়িওয়ালার পিতা/স্বামীর নাম', type: 'text' },
      { id: 'landlord_address', label: 'বাড়িওয়ালার ঠিকানা', type: 'text' },
      { id: 'landlord_nid', label: 'এনআইডি / পাসপোর্ট নং', type: 'text' },
      { id: 'landlord_phone', label: 'মোবাইল নম্বর', type: 'text' },
      { id: 'tenant_name', label: '২য় পক্ষ: ভাড়াটিয়ার নাম', type: 'text' },
      { id: 'tenant_father', label: 'ভাড়াটিয়ার পিতা/স্বামীর নাম', type: 'text' },
      { id: 'tenant_address', label: 'ভাড়াটিয়ার স্থায়ী ঠিকানা', type: 'text' },
      { id: 'tenant_nid', label: 'ভাড়াটিয়ার এনআইডি নং', type: 'text' },
      { id: 'tenant_phone', label: 'ভাড়াটিয়ার মোবাইল নম্বর', type: 'text' }
    ],
    step2: [
      { id: 'property_address', label: 'ভাড়াকৃত সম্পত্তির ঠিকানা ও পূর্ণ বিবরণ', type: 'textarea' },
      { id: 'property_type', label: 'সম্পত্তির ধরণ (যেমন: আবাসিক ফ্ল্যাট / দোকান / বাণিজ্যিক স্পেস)', type: 'text' },
      { id: 'start_date', label: 'চুক্তি কার্যকরের তারিখ', type: 'text' },
      { id: 'duration_months', label: 'চুক্তির মেয়াদ (মাসে)', type: 'number' },
      { id: 'rent_amount', label: 'মাসিক ভাড়া (টাকায়)', type: 'text' },
      { id: 'rent_in_words', label: 'ভাড়ার পরিমাণ (কথায়)', type: 'text' },
      { id: 'payment_due_day', label: 'প্রতি মাসের কত তারিখের মধ্যে পরিশোধযোগ্য', type: 'number' },
      { id: 'deposit_amount', label: 'অগ্রিম জামানতের পরিমাণ (টাকায়)', type: 'text' },
      { id: 'notice_period_months', label: 'চুক্তি বাতিলের নোটিশ পিরিয়ড (মাসে)', type: 'number' },
      { id: 'utility_terms', label: 'ইউটিলিটি ও সার্ভিস চার্জ শর্ত', type: 'textarea' }
    ],
    step4: [
      { id: 'witness1_name', label: '১ম সাক্ষীর নাম', type: 'text' },
      { id: 'witness1_address', label: '১ম সাক্ষীর ঠিকানা', type: 'text' },
      { id: 'witness2_name', label: '২য় সাক্ষীর নাম', type: 'text' },
      { id: 'witness2_address', label: '২য় সাক্ষীর ঠিকানা', type: 'text' }
    ]
  },
  nda_agreement: {
    step1: [
      { id: 'execution_date', label: 'চুক্তির তারিখ / Date', type: 'text' },
      { id: 'disclosing_party_name', label: 'তথ্য প্রকাশকারী (Disclosing Party) নাম/প্রতিষ্ঠান', type: 'text' },
      { id: 'disclosing_party_address', label: 'প্রকাশকারীর ঠিকানা', type: 'text' },
      { id: 'disclosing_party_rep', label: 'অনুমোদিত প্রতিনিধি ও পদবি', type: 'text' },
      { id: 'receiving_party_name', label: 'তথ্য গ্রহণকারী (Receiving Party) নাম/প্রতিষ্ঠান', type: 'text' },
      { id: 'receiving_party_address', label: 'গ্রহণকারীর ঠিকানা', type: 'text' },
      { id: 'receiving_party_rep', label: 'অনুমোদিত প্রতিনিধি ও পদবি', type: 'text' }
    ],
    step2: [
      { id: 'purpose', label: 'তথ্য বিনিময়ের মূল উদ্দেশ্য (Business Purpose)', type: 'textarea' },
      { id: 'duration_years', label: 'গোপনীয়তার মেয়াদ (বছরে)', type: 'number' }
    ],
    step4: []
  },
  freelance_contract: {
    step1: [
      { id: 'execution_date', label: 'চুক্তির তারিখ / Date', type: 'text' },
      { id: 'client_name', label: 'গ্রাহকের নাম / ক্লায়েন্ট কোম্পানি', type: 'text' },
      { id: 'client_address', label: 'গ্রাহকের ঠিকানা', type: 'text' },
      { id: 'client_email', label: 'গ্রাহকের অফিসিয়াল ইমেইল', type: 'text' },
      { id: 'freelancer_name', label: 'ফ্রিল্যান্সার / পরামর্শকের নাম', type: 'text' },
      { id: 'freelancer_title', label: 'পেশাগত পদবি (যেমন: Full-Stack Developer)', type: 'text' },
      { id: 'freelancer_address', label: 'ঠিকানা', type: 'text' },
      { id: 'freelancer_email', label: 'ইমেইল', type: 'text' }
    ],
    step2: [
      { id: 'scope_of_work', label: 'কাজের পরিধি ও ডেলিভারেবলস (Scope of Work)', type: 'textarea' },
      { id: 'currency', label: 'কারেন্সি প্রতীক (যেমন: ৳ বা $)', type: 'text' },
      { id: 'total_amount', label: 'মোট পারিশ্রমিকের পরিমাণ', type: 'text' },
      { id: 'payment_milestones', label: 'পেমেন্ট মাইলস্টোন ও শর্তাবলি', type: 'textarea' },
      { id: 'deadline', label: 'কাজের চূড়ান্ত সমাপ্তির তারিখ', type: 'text' },
      { id: 'free_revisions', label: 'বিনামূল্যে রিভিশন সংখ্যা', type: 'number' }
    ],
    step4: []
  },
  partnership_agreement: {
    step1: [
      { id: 'execution_date', label: 'চুক্তির তারিখ / Date', type: 'text' },
      { id: 'partner1_name', label: '১ম অংশীদারের নাম', type: 'text' },
      { id: 'partner1_father', label: '১ম অংশীদারের পিতা/স্বামীর নাম', type: 'text' },
      { id: 'partner1_address', label: '১ম অংশীদারের ঠিকানা', type: 'text' },
      { id: 'partner1_nid', label: '১ম অংশীদারের এনআইডি নং', type: 'text' },
      { id: 'partner1_phone', label: '১ম অংশীদারের মোবাইল', type: 'text' },
      { id: 'partner2_name', label: '২য় অংশীদারের নাম', type: 'text' },
      { id: 'partner2_father', label: '২য় অংশীদারের পিতা/স্বামীর নাম', type: 'text' },
      { id: 'partner2_address', label: '২য় অংশীদারের ঠিকানা', type: 'text' },
      { id: 'partner2_nid', label: '২য় অংশীদারের এনআইডি নং', type: 'text' },
      { id: 'partner2_phone', label: '২য় অংশীদারের মোবাইল', type: 'text' }
    ],
    step2: [
      { id: 'firm_name', label: 'অংশীদারি প্রতিষ্ঠানের নাম', type: 'text' },
      { id: 'firm_address', label: 'প্রধান কার্যালয়ের ঠিকানা', type: 'text' },
      { id: 'total_capital', label: 'প্রাথমিক মোট মূলধন (টাকায়)', type: 'text' },
      { id: 'partner1_share', label: '১ম অংশীদারের শেয়ার/মুনাফার হার (%)', type: 'number' },
      { id: 'partner2_share', label: '২য় অংশীদারের শেয়ার/মুনাফার হার (%)', type: 'number' },
      { id: 'bank_operation', label: 'ব্যাংক হিসাব পরিচালনা পদ্ধতি', type: 'text' },
      { id: 'notice_period_months', label: 'অংশীদারি অবসানের নোটিশ (মাসে)', type: 'number' }
    ],
    step4: []
  },
  employment_agreement: {
    step1: [
      { id: 'execution_date', label: 'যোগদানের তারিখ / Execution Date', type: 'text' },
      { id: 'company_name', label: 'প্রতিষ্ঠানের নাম (Employer)', type: 'text' },
      { id: 'company_address', label: 'কোম্পানির ঠিকানা', type: 'text' },
      { id: 'company_rep', label: 'কর্তৃপক্ষের নাম ও পদবি', type: 'text' },
      { id: 'employee_name', label: 'কর্মচারী / কর্মকর্তার নাম', type: 'text' },
      { id: 'employee_father', label: 'পিতা/স্বামীর নাম', type: 'text' },
      { id: 'employee_address', label: 'স্থায়ী ঠিকানা', type: 'text' },
      { id: 'employee_nid', label: 'এনআইডি নং', type: 'text' },
      { id: 'employee_phone', label: 'মোবাইল নম্বর', type: 'text' }
    ],
    step2: [
      { id: 'designation', label: 'পদবি (Designation)', type: 'text' },
      { id: 'department', label: 'বিভাগ (Department)', type: 'text' },
      { id: 'salary_amount', label: 'মাসিক সর্বসাকুল্যে বেতন (টাকায়)', type: 'text' },
      { id: 'probation_months', label: 'শিক্ষানবিসকাল (মাসে)', type: 'number' },
      { id: 'notice_period_days', label: 'চাকরি অবসানের নোটিশ পিরিয়ড (দিনে)', type: 'number' }
    ],
    step4: []
  }
};

async function initApp() {
  try {
    const res = await fetch('/api/templates');
    state.templates = await res.json();
    
    // Check if remote signing view requested via URL param (?share_id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share_id');
    if (shareId) {
      await loadSharedContractForSigning(shareId);
    } else {
      setupTemplate(state.currentTemplate);
    }
  } catch (err) {
    console.error('Failed to load templates:', err);
  }

  initSignatureCanvas();
  attachEvents();
}

async function loadSharedContractForSigning(shareId) {
  try {
    const res = await fetch(`/api/contracts/share/${shareId}`);
    if (res.ok) {
      const item = await res.json();
      state.currentContractId = item.id;
      state.currentTemplate = item.document_type;
      state.currentLang = item.language || 'bn';
      const tmplSelect = document.getElementById('template-select');
      if (tmplSelect) tmplSelect.value = item.document_type;
      const langSelect = document.getElementById('lang-select');
      if (langSelect) langSelect.value = state.currentLang;
      setupTemplate(item.document_type, item.data);
      
      // Auto prompt 2nd party to sign
      setTimeout(() => {
        openSignModal('p2');
      }, 600);
    } else {
      alert('শেয়ারকৃত চুক্তিপত্রটি পাওয়া যায়নি বা লিংকটি সঠিক নয়।');
    }
  } catch (e) {
    console.error('Failed to load shared contract:', e);
    alert('চুক্তিপত্র লোড করতে ব্যর্থ হয়েছে: ' + e.message);
  }
}

function setupTemplate(docType, loadedData = null) {
  state.currentTemplate = docType;
  
  if (loadedData) {
    state.formData = loadedData;
    state.customClauses = loadedData.custom_clauses || [];
  } else {
    const currentMeta = state.templates.find(t => t.id === docType);
    if (currentMeta && currentMeta.defaults) {
      state.formData = JSON.parse(JSON.stringify(currentMeta.defaults));
      state.customClauses = state.formData.custom_clauses || [];
    } else {
      state.formData = {};
      state.customClauses = [];
    }
  }

  renderFormFields();
  renderCustomClausesList();
  triggerDocumentRender();
}

function renderFormFields() {
  const def = formDefinitions[state.currentTemplate] || formDefinitions.tenancy_agreement;

  const buildFields = (fields) => {
    return fields.map(f => {
      const val = state.formData[f.id] || '';
      if (f.type === 'textarea') {
        return `
          <div class="form-group">
            <label class="form-label">${f.label}</label>
            <textarea class="form-textarea field-input" data-key="${f.id}" rows="2">${val}</textarea>
          </div>
        `;
      }
      return `
        <div class="form-group">
          <label class="form-label">${f.label}</label>
          <input type="${f.type}" class="form-input field-input" data-key="${f.id}" value="${val}">
        </div>
      `;
    }).join('');
  };

  document.getElementById('parties-form-fields').innerHTML = buildFields(def.step1 || []);
  document.getElementById('terms-form-fields').innerHTML = buildFields(def.step2 || []);
  
  const step4Container = document.getElementById('witness-form-fields');
  if (def.step4 && def.step4.length > 0) {
    step4Container.innerHTML = buildFields(def.step4);
  } else {
    step4Container.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">এই চুক্তির জন্য পৃথক সাক্ষীর ফর্ম প্রযোজ্য নয়। মূল পক্ষদ্বয়ের সরাসরি স্বাক্ষরই যথেষ্ট।</p>';
  }

  document.querySelectorAll('.field-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const key = e.target.getAttribute('data-key');
      state.formData[key] = e.target.value;
      debouncedRender();
    });
  });
}

function debouncedRender() {
  if (state.isDirectEdit) return;
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => {
    triggerDocumentRender();
  }, 250);
}

async function triggerDocumentRender() {
  try {
    state.formData.custom_clauses = state.customClauses;
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_type: state.currentTemplate,
        language: state.currentLang,
        data: state.formData
      })
    });
    if (res.ok) {
      const data = await res.json();
      const container = document.getElementById('preview-container');
      container.innerHTML = data.rendered_html;

      const stamp = document.getElementById('stamp-header');
      if (stamp) {
        stamp.style.display = state.showStamp ? 'flex' : 'none';
      }

      attachClauseExplainerButtons();
      attachSignatureBoxClicks();
      applyWatermarkToPreview();
      refreshDocumentHash();
      updatePageGuideAndCount();
    }
  } catch (err) {
    console.error('Render error:', err);
  }
}

function updatePageGuideAndCount() {
  const container = document.getElementById('preview-container');
  const badge = document.getElementById('preview-page-count-badge');
  if (!container) return;

  // Remove existing dividers
  container.querySelectorAll('.preview-page-divider').forEach(d => d.remove());

  // Wait a microtask / frame for CSS reflow to give exact pixel metrics
  requestAnimationFrame(() => {
    // 1 A4 page height in pixels at 96 DPI: 297mm * 96 / 25.4 = ~1122.5px
    const a4HeightPx = 1122.5;
    const totalHeight = container.scrollHeight;
    const pageCount = Math.max(1, Math.ceil(totalHeight / a4HeightPx));

    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-file"></i> ${pageCount} পৃষ্ঠা (A4)`;
    }

    // If content spans more than 1 A4 page, show clear boundary markers
    if (pageCount > 1) {
      for (let p = 1; p < pageCount; p++) {
        const topOffset = p * a4HeightPx;
        const divider = document.createElement('div');
        divider.className = 'preview-page-divider';
        divider.style.top = `${topOffset}px`;
        divider.innerHTML = `<span><i class="fa-solid fa-scissors"></i> পৃষ্ঠা ${p} সমাপ্ত • পৃষ্ঠা ${p + 1} শুরু (A4 Page Break)</span>`;
        container.appendChild(divider);
      }
    }
  });
}

function applyWatermarkToPreview() {
  const container = document.getElementById('preview-container');
  if (!container) return;

  const existingOverlay = container.querySelector('.sla-watermark-overlay');
  if (existingOverlay) existingOverlay.remove();

  if (state.watermarkMode === 'none') return;

  const labels = {
    draft: 'খসড়া • DRAFT COPY',
    confidential: 'গোপনীয় • CONFIDENTIAL'
  };

  const overlay = document.createElement('div');
  overlay.className = 'sla-watermark-overlay';
  overlay.innerText = labels[state.watermarkMode] || 'খসড়া • DRAFT COPY';
  overlay.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-32deg); font-size: 52px; font-weight: 900; color: rgba(220, 38, 38, 0.12); text-transform: uppercase; letter-spacing: 5px; pointer-events: none; z-index: 10; white-space: nowrap; user-select: none; text-align: center; border: 6px dashed rgba(220, 38, 38, 0.14); padding: 14px 30px; border-radius: 12px;';
  container.style.position = 'relative';
  container.appendChild(overlay);
}

async function refreshDocumentHash() {
  try {
    const container = document.getElementById('preview-container');
    if (!container) return;
    const cleanText = container.innerText || '';
    const res = await fetch('/api/tools/generate-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: cleanText })
    });
    if (res.ok) {
      const data = await res.json();
      state.currentDocHash = data.sha256 || '';
      const badge = document.getElementById('sha-badge-text');
      if (badge) badge.innerText = data.short_hash || '...';
      const fullDisplay = document.getElementById('current-doc-full-hash');
      if (fullDisplay) fullDisplay.innerText = data.sha256 || '';
    }
  } catch (e) {
    console.error('Hash update error:', e);
  }
}

function attachClauseExplainerButtons() {
  const clauses = document.querySelectorAll('#preview-container .clause-item');
  clauses.forEach((cl) => {
    const existingBtn = cl.querySelector('.clause-explain-btn');
    if (!existingBtn) {
      const btn = document.createElement('span');
      btn.className = 'clause-explain-btn';
      btn.innerHTML = '<i class="fa-solid fa-lightbulb"></i> ব্যাখ্যা';
      btn.title = 'ক্লিক করুন: এই ধারাটির সহজ অর্থ ও ঝুঁকি দেখতে';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openClauseExplainer(cl.innerText);
      });
      cl.appendChild(btn);
    }
  });
}

function renderCustomClausesList() {
  const list = document.getElementById('custom-clauses-list');
  if (state.customClauses.length === 0) {
    list.innerHTML = '<p style="color: #94a3b8; font-size: 0.85rem;">কোনো কাস্টম শর্ত যুক্ত করা হয়নি।</p>';
    return;
  }

  list.innerHTML = state.customClauses.map((c, idx) => `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <strong style="font-size: 0.85rem; color: #1e3a8a;">${c.title || 'কাস্টম ধারা'}</strong>
        <button class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; color: #ef4444;" onclick="deleteCustomClause(${idx})">
          <i class="fa-solid fa-trash"></i> মুছে ফেলুন
        </button>
      </div>
      <p style="font-size: 0.82rem; color: #334155; line-height: 1.5;">${c.text}</p>
    </div>
  `).join('');
}

window.deleteCustomClause = function(idx) {
  state.customClauses.splice(idx, 1);
  renderCustomClausesList();
  triggerDocumentRender();
};

function getPartyLabels() {
  const tmpl = state.currentTemplate;
  if (tmpl === 'employment_agreement') {
    return { p1: 'কোম্পানি / মালিক', p2: 'কর্মচারী' };
  } else if (tmpl === 'freelance_contract') {
    return { p1: 'গ্রাহক (Client)', p2: 'ফ্রিল্যান্সার' };
  } else if (tmpl === 'partnership_agreement') {
    return { p1: '১ম অংশীদার', p2: '২য় অংশীদার' };
  } else if (tmpl === 'nda_agreement') {
    return { p1: 'তথ্য প্রকাশকারী', p2: 'তথ্য গ্রহণকারী' };
  }
  return { p1: '১ম পক্ষ (মালিক)', p2: '২য় পক্ষ (ভাড়াটিয়া)' };
}

function selectSignParty(party) {
  state.sigTarget = party;
  const labels = getPartyLabels();
  const targetP1 = document.getElementById('sign-target-p1');
  const targetP2 = document.getElementById('sign-target-p2');
  const p1Badge = document.getElementById('p1-status-badge');
  const p2Badge = document.getElementById('p2-status-badge');
  const signerNameEl = document.getElementById('current-signer-name');
  const existingBox = document.getElementById('existing-sig-box');
  const existingImg = document.getElementById('existing-sig-img');

  const p1Signed = !!state.formData.party1_signature;
  const p2Signed = !!state.formData.party2_signature;

  if (p1Badge) {
    p1Badge.innerHTML = p1Signed ? '<i class="fa-solid fa-check"></i> স্বাক্ষরিত' : 'স্বাক্ষর বাকি';
    p1Badge.style.background = p1Signed ? '#16a34a' : (party === 'p1' ? 'rgba(255,255,255,0.25)' : '#e2e8f0');
    p1Badge.style.color = p1Signed ? '#ffffff' : (party === 'p1' ? '#ffffff' : '#475569');
  }
  if (p2Badge) {
    p2Badge.innerHTML = p2Signed ? '<i class="fa-solid fa-check"></i> স্বাক্ষরিত' : 'স্বাক্ষর বাকি';
    p2Badge.style.background = p2Signed ? '#16a34a' : (party === 'p2' ? 'rgba(255,255,255,0.25)' : '#e2e8f0');
    p2Badge.style.color = p2Signed ? '#ffffff' : (party === 'p2' ? '#ffffff' : '#475569');
  }

  if (party === 'p1') {
    if (targetP1) targetP1.className = 'btn btn-primary';
    if (targetP2) targetP2.className = 'btn btn-secondary';
    if (signerNameEl) signerNameEl.textContent = labels.p1;
    if (p1Signed && existingBox && existingImg) {
      existingBox.style.display = 'flex';
      existingImg.src = state.formData.party1_signature;
    } else if (existingBox) {
      existingBox.style.display = 'none';
    }
  } else {
    if (targetP2) targetP2.className = 'btn btn-primary';
    if (targetP1) targetP1.className = 'btn btn-secondary';
    if (signerNameEl) signerNameEl.textContent = labels.p2;
    if (p2Signed && existingBox && existingImg) {
      existingBox.style.display = 'flex';
      existingImg.src = state.formData.party2_signature;
    } else if (existingBox) {
      existingBox.style.display = 'none';
    }
  }

  const canvas = document.getElementById('sig-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

function openSignModal(targetParty = null) {
  const labels = getPartyLabels();
  const labelP1 = document.getElementById('label-p1-btn');
  const labelP2 = document.getElementById('label-p2-btn');
  if (labelP1) labelP1.textContent = labels.p1;
  if (labelP2) labelP2.textContent = labels.p2;

  let chosen = targetParty;
  if (!chosen) {
    if (state.formData.party1_signature && !state.formData.party2_signature) {
      chosen = 'p2';
    } else {
      chosen = 'p1';
    }
  }

  selectSignParty(chosen);
  document.getElementById('sign-modal').style.display = 'flex';
}

function attachSignatureBoxClicks() {
  document.querySelectorAll('#preview-container .sig-col').forEach(col => {
    col.addEventListener('click', () => {
      const target = col.getAttribute('data-target-sign') || 'p1';
      openSignModal(target);
    });
  });
}

function initSignatureCanvas() {
  const canvas = document.getElementById('sig-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function startDraw(e) {
    state.isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!state.isDrawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDraw() {
    state.isDrawing = false;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDraw(e);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
  }, { passive: false });

  window.addEventListener('touchend', () => {
    stopDraw();
  });

  document.getElementById('btn-clear-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  const targetP1 = document.getElementById('sign-target-p1');
  const targetP2 = document.getElementById('sign-target-p2');
  if (targetP1) targetP1.addEventListener('click', () => { selectSignParty('p1'); });
  if (targetP2) targetP2.addEventListener('click', () => { selectSignParty('p2'); });

  const btnRemoveSig = document.getElementById('btn-remove-sig');
  if (btnRemoveSig) {
    btnRemoveSig.addEventListener('click', () => {
      if (state.sigTarget === 'p1') {
        delete state.formData.party1_signature;
      } else {
        delete state.formData.party2_signature;
      }
      selectSignParty(state.sigTarget);
      triggerDocumentRender();
    });
  }

  document.getElementById('btn-apply-signature').addEventListener('click', async () => {
    // Check if user drew on canvas
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    const hasDrawn = pixelBuffer.some(color => color !== 0);

    if (hasDrawn) {
      const dataUrl = canvas.toDataURL('image/png');
      if (state.sigTarget === 'p1') {
        state.formData.party1_signature = dataUrl;
      } else {
        state.formData.party2_signature = dataUrl;
      }

      // If in remote signing mode or has contract ID, submit back to server
      if (state.currentContractId) {
        try {
          await fetch(`/api/contracts/share/${state.currentContractId}/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              signature_data: dataUrl,
              target: state.sigTarget === 'p1' ? 'party1' : 'party2'
            })
          });
        } catch (e) {
          console.error('Remote signature error:', e);
        }
      }
    }

    await triggerDocumentRender();
    document.getElementById('sign-modal').style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scroll directly to the signature block on the preview document
    setTimeout(() => {
      const sigSec = document.querySelector('.signatures-section');
      if (sigSec) {
        sigSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sigSec.style.transition = 'background 0.4s';
        sigSec.style.background = '#f0fdf4';
        setTimeout(() => { sigSec.style.background = 'transparent'; }, 1200);
      }
    }, 250);
  });
}

// Database History Modal (Private Vault Isolated)
async function openHistoryModal() {
  const modal = document.getElementById('history-modal');
  const container = document.getElementById('history-list-container');
  modal.style.display = 'flex';
  
  const vaultId = getVaultSessionId();
  container.innerHTML = '<p style="text-align: center; color: #0284c7; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> ভল্ট লোড হচ্ছে...</p>';

  try {
    const res = await fetch('/api/contracts', {
      headers: { 'X-Session-ID': vaultId }
    });
    const list = await res.json();

    const vaultBanner = `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: #334155;">
          <i class="fa-solid fa-vault" style="color: #0f172a; font-size: 0.95rem;"></i>
          <span>আপনার ব্যক্তিগত ভল্ট:</span>
          <code style="background: #e2e8f0; padding: 2px 7px; border-radius: 4px; font-weight: 600; color: #0f172a; font-size: 0.8rem;">${vaultId}</code>
        </div>
        <button id="btn-copy-vault" style="background: white; border: 1px solid #cbd5e1; border-radius: 5px; padding: 4px 10px; cursor: pointer; color: #0f172a; font-size: 0.78rem; font-weight: 600; display: flex; align-items: center; gap: 4px;" onclick="copyVaultId()">
          <i class="fa-regular fa-copy"></i> কপি কি
        </button>
      </div>
    `;

    if (!Array.isArray(list) || list.length === 0) {
      container.innerHTML = vaultBanner + '<p style="text-align: center; color: #64748b; padding: 25px;">আপনার ভল্টে এখনো কোনো চুক্তি সংরক্ষিত নেই। বাম পাশের এডিটর থেকে <strong>"খসড়া সেভ করুন"</strong> বাটনে ক্লিক করে সেভ করুন।</p>';
      return;
    }

    container.innerHTML = vaultBanner + list.map(item => `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h4 style="color: #0f172a; font-size: 0.95rem; margin-bottom: 4px;">${item.title}</h4>
          <span style="font-size: 0.8rem; color: #64748b;">
            <i class="fa-regular fa-clock"></i> ${item.updated_at} | <strong>${item.document_type}</strong>
          </span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="loadContractById('${item.id}', '${item.document_type}')">
            <i class="fa-solid fa-folder-open"></i> লোড
          </button>
          <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.8rem; color: #ef4444;" onclick="deleteContractById('${item.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p style="color: #ef4444;">হিস্ট্রি লোড করতে ব্যর্থ হয়েছে।</p>';
  }
}

window.copyVaultId = function() {
  const vid = getVaultSessionId();
  navigator.clipboard.writeText(vid).then(() => {
    const btn = document.getElementById('btn-copy-vault');
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i> কপি হয়েছে!';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-regular fa-copy"></i> কপি কি';
      }, 2000);
    }
  });
};

window.loadContractById = async function(id, docType) {
  try {
    const res = await fetch(`/api/contracts/${id}`, {
      headers: { 'X-Session-ID': getVaultSessionId() }
    });
    const item = await res.json();
    state.currentContractId = item.id;
    document.getElementById('template-select').value = item.document_type;
    setupTemplate(item.document_type, item.data);
    document.getElementById('history-modal').style.display = 'none';
  } catch (err) {
    alert('চুক্তি লোড করতে ব্যর্থ হয়েছে: ' + err.message);
  }
};

window.deleteContractById = async function(id) {
  if (!confirm('আপনি কি নিশ্চিত এই চুক্তিটি মুছে ফেলতে চান?')) return;
  try {
    await fetch(`/api/contracts/${id}`, {
      method: 'DELETE',
      headers: { 'X-Session-ID': getVaultSessionId() }
    });
    openHistoryModal();
  } catch (err) {
    alert('মুছতে ব্যর্থ হয়েছে: ' + err.message);
  }
};

async function openClauseExplainer(clauseText) {
  const modal = document.getElementById('explainer-modal');
  const content = document.getElementById('explainer-content');
  modal.style.display = 'flex';
  content.innerHTML = '<p style="text-align: center; color: #6366f1; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> AI বিশ্লেষণ চলছে...</p>';

  try {
    const res = await fetch('/api/ai/explain-clause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clause_text: clauseText, language: state.currentLang })
    });
    const data = await res.json();
    content.innerHTML = `
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
        <h4 style="color: #1e3a8a; margin-bottom: 6px; font-size: 0.95rem;">সহজ সারসংক্ষেপ:</h4>
        <p style="font-size: 0.92rem; color: #1e293b; line-height: 1.6;">${data.simple_explanation}</p>
      </div>
      <div style="margin-bottom: 16px;">
        <h4 style="color: #0f172a; margin-bottom: 8px; font-size: 0.9rem;"><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> মূল দায়িত্ব:</h4>
        <ul style="padding-left: 20px; font-size: 0.88rem; color: #334155;">
          ${data.key_obligations.map(o => `<li style="margin-bottom: 4px;">${o}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4 style="color: #b91c1c; margin-bottom: 8px; font-size: 0.9rem;"><i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i> সম্ভাব্য ঝুঁকি:</h4>
        <ul style="padding-left: 20px; font-size: 0.88rem; color: #7f1d1d;">
          ${data.potential_risks.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join('')}
        </ul>
      </div>
    `;
  } catch (err) {
    content.innerHTML = '<p style="color: #ef4444;">AI ব্যাখ্যা লোড করতে ব্যর্থ হয়েছে।</p>';
  }
}

function attachEvents() {
  document.querySelectorAll('.step-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.step-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.step-content').forEach(c => c.style.display = 'none');
      tab.classList.add('active');
      const stepNum = tab.getAttribute('data-step');
      document.getElementById(`step-${stepNum}`).style.display = 'block';
    });
  });

  document.getElementById('template-select').addEventListener('change', (e) => {
    state.currentContractId = null;
    setupTemplate(e.target.value);
  });

  document.getElementById('lang-select').addEventListener('change', (e) => {
    state.currentLang = e.target.value;
    triggerDocumentRender();
  });

  // Direct Edit Mode
  const btnToggleEdit = document.getElementById('btn-toggle-edit');
  const previewContainer = document.getElementById('preview-container');
  const editLabel = document.getElementById('edit-mode-label');

  btnToggleEdit.addEventListener('click', () => {
    state.isDirectEdit = !state.isDirectEdit;
    previewContainer.contentEditable = state.isDirectEdit ? 'true' : 'false';
    if (state.isDirectEdit) {
      previewContainer.style.outline = '2px dashed #2563eb';
      btnToggleEdit.style.background = '#dbeafe';
      btnToggleEdit.style.color = '#1d4ed8';
      editLabel.innerText = '✅ এডিট মোড চলছে';
    } else {
      previewContainer.style.outline = 'none';
      btnToggleEdit.style.background = '';
      btnToggleEdit.style.color = '';
      editLabel.innerText = 'সরাসরি পেপারে এডিট';
      updatePageGuideAndCount();
      refreshDocumentHash();
    }
  });

  previewContainer.addEventListener('input', () => {
    if (state.isDirectEdit) {
      updatePageGuideAndCount();
      refreshDocumentHash();
    }
  });

  // Toggle 300 Tk Stamp
  document.getElementById('btn-toggle-stamp').addEventListener('click', () => {
    state.showStamp = !state.showStamp;
    const stamp = document.getElementById('stamp-header');
    if (stamp) {
      stamp.style.display = state.showStamp ? 'flex' : 'none';
    }
    updatePageGuideAndCount();
    refreshDocumentHash();
  });

  // Stamp Duty Calculator Modal
  document.getElementById('btn-open-stamp-calc').addEventListener('click', () => {
    document.getElementById('stamp-calc-modal').style.display = 'flex';
  });

  document.getElementById('btn-run-stamp-calc').addEventListener('click', async () => {
    const docType = document.getElementById('calc-doc-type').value;
    const amount = parseFloat(document.getElementById('calc-amount').value) || 0;
    const duration = parseInt(document.getElementById('calc-duration').value) || 12;

    try {
      const res = await fetch('/api/tools/stamp-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doc_type: docType,
          rent_amount: amount,
          duration_months: duration,
          total_capital: amount
        })
      });
      const data = await res.json();
      const resEl = document.getElementById('stamp-calc-result');
      resEl.style.display = 'block';
      resEl.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="color:#9a3412;">প্রয়োজনীয় স্ট্যাম্প ডিউটি:</strong>
          <span style="font-size:1.3rem; font-weight:800; color:#c2410c;">${data.formatted_stamp}</span>
        </div>
        <p style="font-size:0.86rem; color:#7c2d12; margin-bottom:6px;">${data.explanation}</p>
        <span style="font-size:0.8rem; color:#64748b;"><strong>আইনি রেফারেন্স:</strong> ${data.legal_basis}</span>
        ${data.is_registration_mandatory ? '<div style="margin-top:8px; padding:6px 8px; background:#fee2e2; color:#991b1b; border-radius:4px; font-size:0.8rem; font-weight:bold;">⚠️ ১ বছরের অধিক হওয়ায় সাব-রেজিস্ট্রি অফিসে রেজিস্ট্রেশন বাধ্যতামূলক।</div>' : ''}
      `;
    } catch (e) {
      alert('স্ট্যাম্প হিসাব করতে ব্যর্থ হয়েছে।');
    }
  });

  // Share & Remote Signing Modal
  document.getElementById('btn-share-contract').addEventListener('click', async () => {
    const btn = document.getElementById('btn-share-contract');
    const origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> শেয়ার লিংক তৈরি হচ্ছে...';
    btn.disabled = true;

    try {
      state.formData.custom_clauses = state.customClauses;
      const currentMeta = state.templates.find(t => t.id === state.currentTemplate);
      const title = `${currentMeta ? (state.currentLang === 'bn' ? currentMeta.title_bn : currentMeta.title_en) : 'চুক্তিপত্র'} - ${new Date().toLocaleDateString('bn-BD')}`;
      const vaultId = getVaultSessionId();

      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': vaultId
        },
        body: JSON.stringify({
          id: state.currentContractId || null,
          owner_id: vaultId,
          title: title,
          document_type: state.currentTemplate,
          language: state.currentLang,
          data: state.formData
        })
      });

      if (!res.ok) {
        throw new Error('সার্ভারে চুক্তি সংরক্ষণ ব্যর্থ হয়েছে');
      }

      const resData = await res.json();
      state.currentContractId = resData.id;

      const shareUrl = `${window.location.origin}/?share_id=${state.currentContractId}`;
      document.getElementById('share-url-input').value = shareUrl;
      document.getElementById('btn-whatsapp-share').href = `https://api.whatsapp.com/send?text=${encodeURIComponent('SmartLegal AI এর মাধ্যমে আপনার চুক্তিপত্রে স্বাক্ষরের আমন্ত্রণ: ' + shareUrl)}`;
      document.getElementById('share-modal').style.display = 'flex';
    } catch (err) {
      alert('শেয়ার লিংক তৈরি করতে সমস্যা হয়েছে: ' + err.message);
    } finally {
      btn.innerHTML = origHtml;
      btn.disabled = false;
    }
  });

  document.getElementById('btn-copy-share-url').addEventListener('click', () => {
    const input = document.getElementById('share-url-input');
    input.select();
    input.setSelectionRange(0, 99999);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(input.value);
      } else {
        document.execCommand('copy');
      }
    } catch (_) {
      document.execCommand('copy');
    }
    const btn = document.getElementById('btn-copy-share-url');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> কপিড!';
    setTimeout(() => { btn.innerHTML = '<i class="fa-solid fa-copy"></i> কপি'; }, 1500);
  });

  // Floating Chatbot Interactions
  const fab = document.getElementById('fab-chatbot');
  const chatWindow = document.getElementById('chatbot-window');
  const closeChat = document.getElementById('close-chatbot');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('btn-chat-send');
  const chatBody = document.getElementById('chat-body');

  fab.addEventListener('click', () => {
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
  });
  closeChat.addEventListener('click', () => {
    chatWindow.style.display = 'none';
  });

  const sendChatMessage = async () => {
    const q = chatInput.value.trim();
    if (!q) return;

    chatBody.innerHTML += `<div class="chat-bubble-user">${q}</div>`;
    chatInput.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    const loaderId = 'loader_' + Date.now();
    chatBody.innerHTML += `<div class="chat-bubble-ai" id="${loaderId}"><i class="fa-solid fa-spinner fa-spin"></i> আইনAI লিখছে...</div>`;
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
      const res = await fetch('/api/ai/legal-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, contract_context: state.currentTemplate })
      });
      const data = await res.json();
      const loader = document.getElementById(loaderId);
      if (loader) {
        loader.innerHTML = data.answer.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      }
      chatBody.scrollTop = chatBody.scrollHeight;
    } catch (e) {
      const loader = document.getElementById(loaderId);
      if (loader) loader.innerHTML = 'উত্তর পেতে সমস্যা হয়েছে।';
    }
  };

  chatSend.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // History & Sign buttons
  document.getElementById('btn-history').addEventListener('click', openHistoryModal);
  document.getElementById('btn-open-sign').addEventListener('click', () => openSignModal());
  const step4SignBtn = document.getElementById('btn-step4-sign');
  if (step4SignBtn) step4SignBtn.addEventListener('click', () => openSignModal());

  // Upload Audit
  document.getElementById('btn-upload-audit').addEventListener('click', () => {
    document.getElementById('upload-modal').style.display = 'flex';
  });

  const uploadFileInput = document.getElementById('upload-file-input');
  const uploadTextInput = document.getElementById('upload-text-input');
  const uploadStatus = document.getElementById('upload-file-status');
  const btnRunAudit = document.getElementById('btn-run-upload-audit');

  uploadFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    state.uploadedFileName = file.name;
    const ext = file.name.split('.').pop().toLowerCase();

    // Plain text files can be read directly in the browser
    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        uploadTextInput.value = evt.target.result;
        uploadTextInput.disabled = false;
        btnRunAudit.disabled = false;
        uploadStatus.style.display = 'block';
        uploadStatus.style.background = '#f0fdf4';
        uploadStatus.style.color = '#166534';
        uploadStatus.style.border = '1px solid #bbf7d0';
        uploadStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>${file.name}</strong> টেক্সট ফাইল লোড সম্পন্ন হয়েছে (${uploadTextInput.value.length} অক্ষর)।`;
      };
      reader.readAsText(file);
      return;
    }

    // Binary documents (PDF, DOCX, DOC) must be extracted cleanly via backend
    uploadStatus.style.display = 'block';
    uploadStatus.style.background = '#eff6ff';
    uploadStatus.style.color = '#1e40af';
    uploadStatus.style.border = '1px solid #bfdbfe';
    uploadStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <strong>${file.name}</strong> ফাইল থেকে টেক্সট এক্সট্র্যাক্ট করা হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন...`;
    uploadTextInput.value = `[ফাইল বিশ্লেষণ চলছে: ${file.name}...\nঅনুগ্রহ করে অপেক্ষা করুন...]`;
    uploadTextInput.disabled = true;
    btnRunAudit.disabled = true;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/tools/extract-file-text', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'ফাইল থেকে টেক্সট এক্সট্র্যাক্ট করা সম্ভব হয়নি।');
      }

      uploadTextInput.value = data.extracted_text;
      uploadTextInput.disabled = false;
      btnRunAudit.disabled = false;

      uploadStatus.style.display = 'block';
      uploadStatus.style.background = '#f0fdf4';
      uploadStatus.style.color = '#166534';
      uploadStatus.style.border = '1px solid #bbf7d0';
      uploadStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> <strong>${data.filename}</strong> (${data.detected_format.toUpperCase()}) থেকে ${data.character_count.toLocaleString('bn-BD')} টি অক্ষর সফলভাবে এক্সট্র্যাক্ট করা হয়েছে!`;
    } catch (err) {
      console.error('File extraction error:', err);
      uploadTextInput.value = '';
      uploadTextInput.disabled = false;
      btnRunAudit.disabled = false;

      uploadStatus.style.display = 'block';
      uploadStatus.style.background = '#fef2f2';
      uploadStatus.style.color = '#991b1b';
      uploadStatus.style.border = '1px solid #fecaca';
      uploadStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${err.message || 'ফাইল প্রসেস করতে ব্যর্থ হয়েছে। সরাসরি টেক্সট কপি করে পেস্ট করুন।'}`;
    }
  });

  btnRunAudit.addEventListener('click', async () => {
    const text = uploadTextInput.value.trim();
    if (!text || text.startsWith('[ফাইল বিশ্লেষণ চলছে')) {
      return alert('অনুগ্রহ করে বৈধ টেক্সট বা ফাইল প্রদান করুন।');
    }

    const oldText = btnRunAudit.innerHTML;
    btnRunAudit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI গভীর অডিট বিশ্লেষণ চলছে...';
    btnRunAudit.disabled = true;

    try {
      const filename = state.uploadedFileName || 'Uploaded_Document.docx';
      const res = await fetch('/api/ai/audit-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text, filename: filename })
      });
      if (!res.ok) throw new Error('সার্ভারে অডিট রিকোয়েস্ট ব্যর্থ হয়েছে।');
      const data = await res.json();
      const resContainer = document.getElementById('upload-audit-result');
      resContainer.style.display = 'block';

      const risksHtml = (data.risks_found && data.risks_found.length > 0)
        ? data.risks_found.map(r => `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; border-radius: 0 6px 6px 0; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 0.85rem; color: #991b1b;">${r.clause_topic || 'ঝুঁকিপূর্ণ ধারা'}</strong>
              <span class="badge ${r.severity === 'high' ? 'badge-high' : (r.severity === 'medium' ? 'badge-medium' : 'badge-low')}">
                ${r.severity === 'high' ? 'উচ্চ ঝুঁকি' : (r.severity === 'medium' ? 'মাঝারি ঝুঁকি' : 'সাধারণ সতর্কতা')}
              </span>
            </div>
            <p style="font-size: 0.82rem; color: #7f1d1d; margin: 4px 0;">${r.issue}</p>
            <div style="font-size: 0.8rem; color: #1e40af; background: #eff6ff; padding: 6px 8px; border-radius: 4px; margin-top: 4px;">
              <strong>পরামর্শ:</strong> ${r.recommendation}
            </div>
          </div>
        `).join('')
        : '<p style="font-size: 0.82rem; color: #166534;">কোনো উচ্চ ঝুঁকি পাওয়া যায়নি।</p>';

      const missingHtml = (data.missing_clauses && data.missing_clauses.length > 0)
        ? `
          <h4 style="font-size: 0.88rem; color: #b45309; margin: 12px 0 6px 0; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-triangle-exclamation"></i> মিসিং বা অনুপস্থিত আবশ্যকীয় সুরক্ষাধারা:
          </h4>
          <ul style="padding-left: 20px; font-size: 0.82rem; color: #92400e; margin: 0 0 10px 0;">
            ${data.missing_clauses.map(m => `<li style="margin-bottom: 4px;">${m}</li>`).join('')}
          </ul>
        `
        : '';

      resContainer.innerHTML = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
            <strong style="color: #1e3a8a; font-size: 0.95rem;">
              <i class="fa-solid fa-scale-balanced"></i> ${data.detected_type || 'শনাক্তকৃত চুক্তিপত্র'}
            </strong>
            <span class="badge ${data.score >= 80 ? 'badge-low' : (data.score >= 60 ? 'badge-medium' : 'badge-high')}">
              নিরাপত্তা স্কোর: ${data.score}/100
            </span>
          </div>
          <p style="font-size: 0.88rem; color: #334155; line-height: 1.5; margin: 0;">${data.summary}</p>
        </div>
        <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-shield-halved" style="color: #ef4444;"></i> চিহ্নিত ঝুঁকিপূর্ণ শর্তসমূহ:
        </h4>
        ${risksHtml}
        ${missingHtml}
      `;
    } catch (err) {
      alert('অডিট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      btnRunAudit.innerHTML = oldText;
      btnRunAudit.disabled = false;
    }
  });

  // Save Contract to SQLite Database
  document.getElementById('btn-save-draft').addEventListener('click', async () => {
    state.formData.custom_clauses = state.customClauses;
    const currentMeta = state.templates.find(t => t.id === state.currentTemplate);
    const title = `${currentMeta ? currentMeta.title_bn : 'চুক্তিপত্র'} - ${new Date().toLocaleDateString('bn-BD')}`;

    try {
      const vaultId = getVaultSessionId();
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': vaultId
        },
        body: JSON.stringify({
          id: state.currentContractId,
          owner_id: vaultId,
          title: title,
          document_type: state.currentTemplate,
          language: state.currentLang,
          data: state.formData
        })
      });
      const data = await res.json();
      state.currentContractId = data.id;

      const btn = document.getElementById('btn-save-draft');
      const oldText = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i> সেভ হয়েছে!';
      setTimeout(() => { btn.innerHTML = oldText; }, 2000);
    } catch (err) {
      alert('ডাটাবেসে সেভ করতে সমস্যা হয়েছে।');
    }
  });

  // AI Refine Clause Button
  document.getElementById('btn-refine-clause').addEventListener('click', async () => {
    const rawInput = document.getElementById('ai-clause-input').value.trim();
    if (!rawInput) return alert('অনুগ্রহ করে শর্তটি লিখুন।');

    const btn = document.getElementById('btn-refine-clause');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI পলিশ করছে...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/ai/refine-clause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawInput,
          document_type: state.currentTemplate,
          language: state.currentLang
        })
      });

      if (res.ok) {
        const data = await res.json();
        state.lastRefinedClause = data;
        document.getElementById('ai-res-title').innerText = data.title || 'বিশেষ ধারা';
        document.getElementById('ai-res-risk').innerText = (data.risk_level || 'Low') + ' Risk';
        document.getElementById('ai-res-text').innerText = data.refined_clause;
        document.getElementById('ai-clause-result').style.display = 'block';
      }
    } catch (err) {
      alert('AI রূপান্তর করতে ব্যর্থ হয়েছে।');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  document.getElementById('btn-add-clause').addEventListener('click', () => {
    if (state.lastRefinedClause) {
      state.customClauses.push({
        title: state.lastRefinedClause.title,
        text: state.lastRefinedClause.refined_clause
      });
      renderCustomClausesList();
      triggerDocumentRender();
      document.getElementById('ai-clause-result').style.display = 'none';
      document.getElementById('ai-clause-input').value = '';
    }
  });

  document.getElementById('btn-explain-clause-action').addEventListener('click', () => {
    if (state.lastRefinedClause) {
      openClauseExplainer(state.lastRefinedClause.refined_clause);
    }
  });

  // Universal Modal Closers
  const allModals = ['explainer-modal', 'sign-modal', 'history-modal', 'upload-modal', 'stamp-calc-modal', 'share-modal'];
  const closeAllModals = () => {
    allModals.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  };

  allModals.forEach(id => {
    const modalEl = document.getElementById(id);
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target.id === id) modalEl.style.display = 'none';
      });
    }
  });

  ['close-explainer', 'btn-close-explainer-footer', 'close-sign', 'btn-close-sign-footer',
   'close-history', 'btn-close-history-footer', 'close-upload', 'btn-close-upload-footer',
   'close-stamp-calc', 'btn-close-stamp-calc-footer', 'close-share', 'btn-close-share-footer'].forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', closeAllModals);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // Instant Client-Side Print & Vector PDF Export (0ms server load)
  const btnPrintInstant = document.getElementById('btn-print-instant');
  if (btnPrintInstant) {
    btnPrintInstant.addEventListener('click', () => {
      applyWatermarkToPreview();
      refreshDocumentHash();
      window.print();
    });
  }

  // Server-Side Headless Chrome PDF Export
  document.getElementById('btn-pdf').addEventListener('click', async () => {
    const btn = document.getElementById('btn-pdf');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> সার্ভার PDF তৈরি হচ্ছে...';
    btn.disabled = true;

    // Helpful progressive feedback if cloud server is waking from sleep
    const wakeTimer = setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> সার্ভার প্রস্তুত হচ্ছে (ক্লাউড চালু হচ্ছে)...';
    }, 3500);

    try {
      const res = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: state.currentTemplate,
          language: state.currentLang,
          data: state.formData
        })
      });

      clearTimeout(wakeTimer);

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.currentTemplate}_verified.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        let errMsg = 'PDF তৈরি করতে সমস্যা হয়েছে।';
        try {
          const errData = await res.json();
          if (errData && errData.detail) {
            errMsg = `PDF তৈরি ব্যর্থ হয়েছে: ${errData.detail}`;
          }
        } catch (_) {}
        alert(errMsg);
      }
    } catch (err) {
      clearTimeout(wakeTimer);
      alert('PDF ডাউনলোড ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      clearTimeout(wakeTimer);
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  // Word DOCX Export
  document.getElementById('btn-docx').addEventListener('click', async () => {
    const btn = document.getElementById('btn-docx');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Word তৈরি হচ্ছে...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/export/docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: state.currentTemplate,
          language: state.currentLang,
          data: state.formData
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.currentTemplate}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Word ফাইল তৈরি করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('DOCX ডাউনলোড ব্যর্থ হয়েছে: ' + err.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  // Phase 5: Watermark Toggle
  const btnWatermark = document.getElementById('btn-toggle-watermark');
  const watermarkLabel = document.getElementById('watermark-label');
  if (btnWatermark) {
    btnWatermark.addEventListener('click', () => {
      if (state.watermarkMode === 'none') {
        state.watermarkMode = 'draft';
        if (watermarkLabel) watermarkLabel.innerText = 'ওয়াটারমার্ক: খসড়া';
        btnWatermark.style.background = '#fee2e2';
        btnWatermark.style.color = '#dc2626';
      } else if (state.watermarkMode === 'draft') {
        state.watermarkMode = 'confidential';
        if (watermarkLabel) watermarkLabel.innerText = 'ওয়াটারমার্ক: গোপনীয়';
        btnWatermark.style.background = '#fef3c7';
        btnWatermark.style.color = '#d97706';
      } else {
        state.watermarkMode = 'none';
        if (watermarkLabel) watermarkLabel.innerText = 'ওয়াটারমার্ক: বন্ধ';
        btnWatermark.style.background = '';
        btnWatermark.style.color = '';
      }
      applyWatermarkToPreview();
    });
  }

  // Phase 5: Hash Badge Click opens Verify Modal
  const hashBadge = document.getElementById('crypto-fingerprint-badge');
  if (hashBadge) {
    hashBadge.addEventListener('click', () => {
      const modal = document.getElementById('verify-modal');
      if (modal) modal.style.display = 'flex';
    });
  }

  // Phase 5: Legal Notice Generator Modal Handlers
  const btnOpenNotice = document.getElementById('btn-open-notice');
  const noticeModal = document.getElementById('notice-modal');
  const closeNotice = document.getElementById('close-notice');
  const btnCloseNoticeFooter = document.getElementById('btn-close-notice-footer');
  const btnGenerateNoticeSubmit = document.getElementById('btn-generate-notice-submit');
  const btnCopyNotice = document.getElementById('btn-copy-notice');
  const btnInjectNotice = document.getElementById('btn-inject-notice');

  let lastGeneratedNotice = null;

  if (btnOpenNotice && noticeModal) {
    btnOpenNotice.addEventListener('click', () => {
      const landlord = state.formData.landlord_name || state.formData.party1_name || state.formData.employer_name || '';
      const tenant = state.formData.tenant_name || state.formData.party2_name || state.formData.employee_name || '';
      const address = state.formData.property_address || state.formData.landlord_address || '';

      const landlordInput = document.getElementById('notice-landlord');
      const tenantInput = document.getElementById('notice-tenant');
      const addressInput = document.getElementById('notice-address');

      if (landlordInput && !landlordInput.value) landlordInput.value = landlord;
      if (tenantInput && !tenantInput.value) tenantInput.value = tenant;
      if (addressInput && !addressInput.value) addressInput.value = address;

      noticeModal.style.display = 'flex';
    });
  }

  if (closeNotice) closeNotice.addEventListener('click', () => { noticeModal.style.display = 'none'; });
  if (btnCloseNoticeFooter) btnCloseNoticeFooter.addEventListener('click', () => { noticeModal.style.display = 'none'; });

  if (btnGenerateNoticeSubmit) {
    btnGenerateNoticeSubmit.addEventListener('click', async () => {
      const noticeType = document.getElementById('notice-type-select').value;
      const landlord = document.getElementById('notice-landlord').value;
      const tenant = document.getElementById('notice-tenant').value;
      const address = document.getElementById('notice-address').value;
      const reason = document.getElementById('notice-reason').value;

      const originalBtnText = btnGenerateNoticeSubmit.innerHTML;
      btnGenerateNoticeSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> নোটিশ তৈরি হচ্ছে...';
      btnGenerateNoticeSubmit.disabled = true;

      try {
        const res = await fetch('/api/tools/generate-notice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            notice_type: noticeType,
            contract_data: {
              landlord_name: landlord,
              tenant_name: tenant,
              property_address: address,
              rent_amount: state.formData.rent_amount || '15,000',
              landlord_phone: state.formData.landlord_phone || '০১XXXXXXXXX'
            },
            custom_reason: reason
          })
        });

        if (res.ok) {
          const data = await res.json();
          lastGeneratedNotice = data;
          document.getElementById('notice-output-title').innerText = data.title;
          document.getElementById('notice-output-body').innerText = data.body;
          document.getElementById('notice-output-container').style.display = 'block';
        } else {
          alert('নোটিশ তৈরি করতে সমস্যা হয়েছে।');
        }
      } catch (err) {
        alert('ত্রুটি: ' + err.message);
      } finally {
        btnGenerateNoticeSubmit.innerHTML = originalBtnText;
        btnGenerateNoticeSubmit.disabled = false;
      }
    });
  }

  if (btnCopyNotice) {
    btnCopyNotice.addEventListener('click', () => {
      if (!lastGeneratedNotice) return;
      navigator.clipboard.writeText(lastGeneratedNotice.body).then(() => {
        btnCopyNotice.innerHTML = '<i class="fa-solid fa-check"></i> কপি হয়েছে!';
        setTimeout(() => {
          btnCopyNotice.innerHTML = '<i class="fa-solid fa-copy"></i> কপি';
        }, 1800);
      });
    });
  }

  if (btnInjectNotice) {
    btnInjectNotice.addEventListener('click', () => {
      if (!lastGeneratedNotice) return;
      const container = document.getElementById('preview-container');
      container.innerHTML = '<div style="font-family: Hind Siliguri, sans-serif; line-height: 1.65; color: #0f172a;"><div style="border-bottom: 2px solid #991b1b; padding-bottom: 8px; margin-bottom: 20px; text-align: center;"><h2 style="font-size: 17pt; color: #991b1b; margin: 0;">' + lastGeneratedNotice.title + '</h2><div style="font-size: 10.5pt; color: #475569; margin-top: 4px;">আইনি ও প্রথাগত উচ্ছেদ/নবায়ন নোটিশ</div></div><div style="font-weight: 700; color: #1e3a8a; margin-bottom: 14px; font-size: 11.5pt;">' + lastGeneratedNotice.subject + '</div><div style="white-space: pre-wrap; font-size: 11pt; line-height: 1.65; color: #1e293b; text-align: justify;">' + lastGeneratedNotice.body + '</div><div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 9pt; color: #64748b; text-align: center;">SmartLegal AI Notice Engine • প্রস্তুতের তারিখ: ' + lastGeneratedNotice.date + '</div></div>';
      noticeModal.style.display = 'none';
      applyWatermarkToPreview();
      refreshDocumentHash();
      updatePageGuideAndCount();
    });
  }

  // Phase 5: Tamper-Proof SHA-256 Verification Modal Handlers
  const btnVerifyTamper = document.getElementById('btn-verify-tamper');
  const verifyModal = document.getElementById('verify-modal');
  const closeVerify = document.getElementById('close-verify');
  const btnCloseVerifyFooter = document.getElementById('btn-close-verify-footer');
  const btnRunVerifySubmit = document.getElementById('btn-run-verify-submit');
  const verifyResultBox = document.getElementById('verify-result-box');

  if (btnVerifyTamper && verifyModal) {
    btnVerifyTamper.addEventListener('click', () => {
      verifyModal.style.display = 'flex';
      refreshDocumentHash();
    });
  }

  if (closeVerify) closeVerify.addEventListener('click', () => { verifyModal.style.display = 'none'; });
  if (btnCloseVerifyFooter) btnCloseVerifyFooter.addEventListener('click', () => { verifyModal.style.display = 'none'; });

  if (btnRunVerifySubmit) {
    btnRunVerifySubmit.addEventListener('click', async () => {
      const expectedHash = document.getElementById('verify-hash-input').value.trim();
      if (!expectedHash) {
        alert('অনুগ্রহ করে রেফারেন্স হ্যাশ কোড ইনপুট দিন।');
        return;
      }

      const container = document.getElementById('preview-container');
      const currentContent = container ? container.innerText : '';

      btnRunVerifySubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> যাচাই হচ্ছে...';
      btnRunVerifySubmit.disabled = true;

      try {
        const res = await fetch('/api/tools/verify-hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: currentContent,
            expected_hash: expectedHash
          })
        });

        if (res.ok) {
          const result = await res.json();
          verifyResultBox.style.display = 'block';

          if (result.is_valid) {
            verifyResultBox.innerHTML = '<div style="background: #ecfdf5; border: 1.5px solid #10b981; border-radius: 8px; padding: 14px; color: #065f46;"><div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; margin-bottom: 6px;"><i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.2rem;"></i> দলিলটি ১০০% অবিকৃত ও খাঁটি (AUTHENTIC & UN-TAMPERED)</div><p style="font-size: 0.85rem; margin: 0; line-height: 1.5;">ক্রিপ্টোগ্রাফিক হ্যাশ শতভাগ মিলে গেছে। স্বাক্ষরের পর দলিলে কোনো কাটছাঁট বা অবৈধ পরিবর্তন করা হয়নি।</p><div style="margin-top: 8px; font-family: monospace; font-size: 0.78rem; color: #047857;">Computed Hash: ' + result.computed_hash + '</div></div>';
          } else {
            verifyResultBox.innerHTML = '<div style="background: #fef2f2; border: 1.5px solid #ef4444; border-radius: 8px; padding: 14px; color: #991b1b;"><div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; margin-bottom: 6px;"><i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 1.2rem;"></i> সতর্কতা: দলিলটি বিকৃত বা পরিবর্তিত (TAMPERED / MODIFIED)</div><p style="font-size: 0.85rem; margin: 0; line-height: 1.5;">প্রদত্ত রেফারেন্স হ্যাশের সাথে বর্তমান দলিলের হ্যাশ মেলেনি। মূল ডকুমেন্টের তথ্য বিকৃত বা পরিবর্তন করা হয়েছে।</p><div style="margin-top: 8px; font-family: monospace; font-size: 0.78rem; color: #b91c1c;">Current Hash: ' + result.computed_hash + '</div></div>';
          }
        } else {
          alert('হ্যাশ যাচাই করতে ব্যর্থ হয়েছে।');
        }
      } catch (err) {
        alert('ত্রুটি: ' + err.message);
      } finally {
        btnRunVerifySubmit.innerHTML = '<i class="fa-solid fa-shield-halved"></i> দলিলের প্রমাণিকতা যাচাই করুন';
        btnRunVerifySubmit.disabled = false;
      }
    });
  }

  // Active Tab Keep-Warm: prevents Render.com free instance from sleeping while user drafts
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      fetch('/api/health').catch(() => {});
    }
  }, 3 * 60 * 1000);

  // Re-calculate A4 preview boundaries on viewport/font resize
  window.addEventListener('resize', () => {
    updatePageGuideAndCount();
  });
}

window.addEventListener('DOMContentLoaded', initApp);

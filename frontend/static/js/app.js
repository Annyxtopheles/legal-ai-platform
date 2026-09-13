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
  isDrawing: false
};

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
      document.getElementById('template-select').value = item.document_type;
      setupTemplate(item.document_type, item.data);
      
      // Auto prompt 2nd party to sign
      setTimeout(() => {
        state.sigTarget = 'p2';
        document.getElementById('sign-target-p2').className = 'btn btn-primary';
        document.getElementById('sign-target-p1').className = 'btn btn-secondary';
        document.getElementById('sign-modal').style.display = 'flex';
      }, 600);
    }
  } catch (e) {
    console.error('Failed to load shared contract:', e);
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
    }
  } catch (err) {
    console.error('Render error:', err);
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
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
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
    e.preventDefault();
  }

  function stopDraw() {
    state.isDrawing = false;
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  window.addEventListener('touchend', stopDraw);

  document.getElementById('btn-clear-canvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  const targetP1 = document.getElementById('sign-target-p1');
  const targetP2 = document.getElementById('sign-target-p2');

  targetP1.addEventListener('click', () => {
    state.sigTarget = 'p1';
    targetP1.className = 'btn btn-primary';
    targetP2.className = 'btn btn-secondary';
  });

  targetP2.addEventListener('click', () => {
    state.sigTarget = 'p2';
    targetP2.className = 'btn btn-primary';
    targetP1.className = 'btn btn-secondary';
  });

  document.getElementById('btn-apply-signature').addEventListener('click', async () => {
    const dataUrl = canvas.toDataURL('image/png');
    if (state.sigTarget === 'p1') {
      state.formData.party1_signature = dataUrl;
    } else {
      state.formData.party2_signature = dataUrl;
    }

    // If in remote signing mode, submit back to server
    if (state.currentContractId) {
      fetch(`/api/contracts/share/${state.currentContractId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature_data: dataUrl, target: state.sigTarget === 'p1' ? 'party1' : 'party2' })
      });
    }

    triggerDocumentRender();
    document.getElementById('sign-modal').style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
}

// Database History Modal
async function openHistoryModal() {
  const modal = document.getElementById('history-modal');
  const container = document.getElementById('history-list-container');
  modal.style.display = 'flex';
  container.innerHTML = '<p style="text-align: center; color: #0284c7; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> লোড হচ্ছে...</p>';

  try {
    const res = await fetch('/api/contracts');
    const list = await res.json();

    if (list.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">ডাটাবেসে কোনো সংরক্ষিত চুক্তি নেই।</p>';
      return;
    }

    container.innerHTML = list.map(item => `
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

window.loadContractById = async function(id, docType) {
  try {
    const res = await fetch(`/api/contracts/${id}`);
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
    await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
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
    }
  });

  // Toggle 300 Tk Stamp
  document.getElementById('btn-toggle-stamp').addEventListener('click', () => {
    state.showStamp = !state.showStamp;
    const stamp = document.getElementById('stamp-header');
    if (stamp) {
      stamp.style.display = state.showStamp ? 'flex' : 'none';
    }
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
    // If not yet saved to DB, save now to generate ID
    if (!state.currentContractId) {
      state.formData.custom_clauses = state.customClauses;
      const currentMeta = state.templates.find(t => t.id === state.currentTemplate);
      const title = `${currentMeta ? currentMeta.title_bn : 'চুক্তিপত্র'} - ${new Date().toLocaleDateString('bn-BD')}`;
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: null,
          title: title,
          document_type: state.currentTemplate,
          language: state.currentLang,
          data: state.formData
        })
      });
      const resData = await res.json();
      state.currentContractId = resData.id;
    }

    const shareUrl = `${window.location.origin}/?share_id=${state.currentContractId}`;
    document.getElementById('share-url-input').value = shareUrl;
    document.getElementById('btn-whatsapp-share').href = `https://api.whatsapp.com/send?text=${encodeURIComponent('SmartLegal AI এর মাধ্যমে আপনার চুক্তিপত্রে স্বাক্ষরের আমন্ত্রণ: ' + shareUrl)}`;
    document.getElementById('share-modal').style.display = 'flex';
  });

  document.getElementById('btn-copy-share-url').addEventListener('click', () => {
    const input = document.getElementById('share-url-input');
    input.select();
    navigator.clipboard.writeText(input.value);
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
  const openSign = () => { document.getElementById('sign-modal').style.display = 'flex'; };
  document.getElementById('btn-open-sign').addEventListener('click', openSign);
  const step4SignBtn = document.getElementById('btn-step4-sign');
  if (step4SignBtn) step4SignBtn.addEventListener('click', openSign);

  // Upload Audit
  document.getElementById('btn-upload-audit').addEventListener('click', () => {
    document.getElementById('upload-modal').style.display = 'flex';
  });

  document.getElementById('upload-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => { document.getElementById('upload-text-input').value = evt.target.result; };
      reader.readAsText(file);
    }
  });

  document.getElementById('btn-run-upload-audit').addEventListener('click', async () => {
    const text = document.getElementById('upload-text-input').value.trim();
    if (!text) return alert('অনুগ্রহ করে টেক্সট বা ফাইল প্রদান করুন।');

    const btn = document.getElementById('btn-run-upload-audit');
    const oldText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> অডিট চলছে...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/ai/audit-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: text, filename: 'Uploaded_Contract.txt' })
      });
      const data = await res.json();
      const resContainer = document.getElementById('upload-audit-result');
      resContainer.style.display = 'block';

      resContainer.innerHTML = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: #1e3a8a;">${data.detected_type}</strong>
            <span class="badge ${data.score >= 80 ? 'badge-low' : 'badge-medium'}">নিরাপত্তা স্কোর: ${data.score}/100</span>
          </div>
          <p style="font-size: 0.88rem; color: #334155;">${data.summary}</p>
        </div>
        <h4 style="font-size: 0.9rem; color: #0f172a; margin-bottom: 8px;">চিহ্নিত ঝুঁকিপূর্ণ শর্ত:</h4>
        ${data.risks_found.map(r => `
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; border-radius: 0 6px 6px 0; margin-bottom: 8px;">
            <strong style="font-size: 0.85rem; color: #991b1b;">${r.clause_topic}</strong>
            <p style="font-size: 0.82rem; color: #7f1d1d; margin: 4px 0;">${r.issue}</p>
            <span style="font-size: 0.8rem; color: #1e40af;"><strong>পরামর্শ:</strong> ${r.recommendation}</span>
          </div>
        `).join('')}
      `;
    } catch (err) {
      alert('অডিট করতে সমস্যা হয়েছে।');
    } finally {
      btn.innerHTML = oldText;
      btn.disabled = false;
    }
  });

  // Save Contract to SQLite Database
  document.getElementById('btn-save-draft').addEventListener('click', async () => {
    state.formData.custom_clauses = state.customClauses;
    const currentMeta = state.templates.find(t => t.id === state.currentTemplate);
    const title = `${currentMeta ? currentMeta.title_bn : 'চুক্তিপত্র'} - ${new Date().toLocaleDateString('bn-BD')}`;

    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.currentContractId,
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

  // PDF Export
  document.getElementById('btn-pdf').addEventListener('click', async () => {
    const btn = document.getElementById('btn-pdf');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> তৈরি হচ্ছে...';
    btn.disabled = true;

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

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${state.currentTemplate}_verified.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('PDF তৈরি করতে সমস্যা হয়েছে।');
      }
    } catch (err) {
      alert('PDF ডাউনলোড ব্যর্থ হয়েছে: ' + err.message);
    } finally {
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
}

window.addEventListener('DOMContentLoaded', initApp);

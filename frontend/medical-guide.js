// Medical Guide for Refugee Connect
class MedicalGuide {
  constructor() {
    this.conditions = {
      fever: {
        title: 'Fever / High Temperature',
        icon: '🌡️',
        symptoms: [
          'Body temperature above 38°C (100.4°F)',
          'Feeling hot or sweating',
          'Chills or shivering',
          'Headache',
          'Muscle aches',
          'Weakness or tiredness',
          'Loss of appetite'
        ],
        questions: [
          'Is your temperature above 38°C (100.4°F)?',
          'How long have you had the fever?',
          'Do you have difficulty breathing?',
          'Are you vomiting or unable to keep fluids down?',
          'Do you have severe headache or neck stiffness?'
        ],
        advice: {
          mild: {
            en: 'Rest in a cool place. Drink plenty of fluids (water, clear broths). Remove excess clothing. Monitor temperature every 2-4 hours. If fever persists more than 3 days, seek medical help.',
            ar: 'استرح في مكان بارد. اشرب الكثير من السوائل (الماء، المرق الصافي). انزع الملابس الزائدة. راقب درجة الحرارة كل 2-4 ساعات. إذا استمرت الحمى أكثر من 3 أيام، اطلب المساعدة الطبية.',
            fa: 'در جای خنک استراحت کنید. مایعات زیاد بنوشید (آب، آبگوشت شفاف). لباس‌های اضافی را درآورید. هر 2-4 ساعت دما را چک کنید. اگر تب بیش از 3 روز ادامه یافت، کمک پزشکی بگیرید.'
          },
          urgent: {
            en: 'SEEK IMMEDIATE MEDICAL HELP! Go to hospital or call emergency services. This may be a serious infection requiring urgent treatment.',
            ar: 'اطلب المساعدة الطبية الفورية! اذهب إلى المستشفى أو اتصل بخدمات الطوارئ. قد تكون هذه عدوى خطيرة تتطلب علاجاً عاجلاً.',
            fa: 'فوراً کمک پزشکی بگیرید! به بیمارستان بروید یا با اورژانس تماس بگیرید. این ممکن است عفونت جدی باشد که نیاز به درمان فوری دارد.'
          }
        },
        urgentIf: [
          'Temperature above 39.5°C (103°F)',
          'Difficulty breathing or shortness of breath',
          'Severe headache with neck stiffness',
          'Persistent vomiting',
          'Signs of dehydration',
          'Confusion or altered consciousness',
          'Fever in pregnant women',
          'Fever with severe abdominal pain'
        ]
      },
      
      bleeding: {
        title: 'Bleeding / Wounds',
        icon: '🩸',
        symptoms: [
          'Visible blood from wound',
          'Cut or laceration',
          'Puncture wound',
          'Heavy bleeding',
          'Pain at injury site',
          'Swelling around wound'
        ],
        questions: [
          'Is the bleeding heavy or spurting?',
          'Can you see the depth of the wound?',
          'Is there foreign object in the wound?',
          'When did the injury occur?',
          'Are you feeling dizzy or weak?'
        ],
        advice: {
          immediate: {
            en: 'APPLY DIRECT PRESSURE with clean cloth. Raise the wounded area above heart level if possible. Do NOT remove embedded objects. Seek immediate medical help for deep cuts or heavy bleeding.',
            ar: 'اضغط مباشرة بقطعة قماش نظيفة. ارفع المنطقة المصابة فوق مستوى القلب إن أمكن. لا تزل الأجسام المدفونة في الجرح. اطلب المساعدة الطبية الفورية للجروح العميقة أو النزيف الغزير.',
            fa: 'فشار مستقیم با پارچه تمیز اعمال کنید. در صورت امکان، ناحیه زخمی را بالاتر از سطح قلب قرار دهید. اجسام فرو رفته را خارج نکنید. برای بریدگی‌های عمیق یا خونریزی شدید فوراً کمک پزشکی بگیرید.'
          }
        },
        urgentIf: [
          'Heavy bleeding that won\'t stop with pressure',
          'Deep wounds showing fat, muscle, or bone',
          'Wounds on face, hands, genitals, or joints',
          'Foreign objects embedded in wound',
          'Signs of infection (pus, red streaks, fever)',
          'Animal or human bites',
          'Wounds from dirty or rusty objects'
        ],
        urgent: true
      },
      
      breathing: {
        title: 'Breathing Problems',
        icon: '😮‍💨',
        symptoms: [
          'Difficulty breathing or shortness of breath',
          'Rapid breathing',
          'Wheezing or whistling sounds',
          'Chest tightness or pain',
          'Blue lips or fingernails',
          'Cannot speak in full sentences'
        ],
        questions: [
          'Are you having severe difficulty breathing?',
          'Do you have chest pain?',
          'Are your lips or fingernails blue?',
          'Do you have a history of asthma?',
          'Did this start suddenly?'
        ],
        advice: {
          immediate: {
            en: 'CALL EMERGENCY SERVICES IMMEDIATELY! Sit upright, try to stay calm. Loosen tight clothing. If you have rescue medication (inhaler), use it as directed.',
            ar: 'اتصل بخدمات الطوارئ فوراً! اجلس منتصباً، حاول أن تبقى هادئاً. فك الملابس الضيقة. إذا كان لديك دواء إنقاذ (بخاخ)، استخدمه كما هو موجه.',
            fa: 'فوراً با خدمات اورژانس تماس بگیرید! صاف بنشینید، سعی کنید آرام بمانید. لباس‌های تنگ را شل کنید. اگر داروی نجات (اسپری) دارید، طبق دستورالعمل استفاده کنید.'
          }
        },
        urgentIf: [
          'Severe difficulty breathing',
          'Blue lips, face, or fingernails',
          'Cannot speak due to breathlessness',
          'Chest pain with breathing difficulty',
          'Sudden onset of breathing problems'
        ],
        urgent: true
      },
      
      pain: {
        title: 'Severe Pain',
        icon: '😣',
        symptoms: [
          'Intense pain (8-10 out of 10)',
          'Pain that prevents normal activities',
          'Pain with nausea or vomiting',
          'Pain that worsens rapidly',
          'Pain with fever',
          'Pain with difficulty moving'
        ],
        questions: [
          'On a scale of 1-10, how severe is your pain?',
          'Where exactly is the pain located?',
          'Does the pain spread to other areas?',
          'When did the pain start?',
          'What makes the pain better or worse?'
        ],
        advice: {
          mild: {
            en: 'Rest the affected area. Apply ice for 15-20 minutes if swelling. Avoid activities that worsen pain. Monitor for changes. Seek medical help if pain persists or worsens.',
            ar: 'أرح المنطقة المصابة. ضع الثلج لمدة 15-20 دقيقة في حالة التورم. تجنب الأنشطة التي تزيد الألم. راقب التغييرات. اطلب المساعدة الطبية إذا استمر الألم أو ازداد سوءاً.',
            fa: 'ناحیه آسیب‌دیده را استراحت دهید. در صورت تورم، 15-20 دقیقه یخ بگذارید. از فعالیت‌هایی که درد را بدتر می‌کنند اجتناب کنید. تغییرات را رصد کنید. اگر درد ادامه یافت یا بدتر شد، کمک پزشکی بگیرید.'
          },
          urgent: {
            en: 'SEEK IMMEDIATE MEDICAL HELP! Severe pain may indicate serious injury or medical emergency requiring urgent treatment.',
            ar: 'اطلب المساعدة الطبية الفورية! الألم الشديد قد يشير إلى إصابة خطيرة أو حالة طبية طارئة تتطلب علاجاً عاجلاً.',
            fa: 'فوراً کمک پزشکی بگیرید! درد شدید ممکن است نشانه آسیب جدی یا اورژانس پزشکی باشد که نیاز به درمان فوری دارد.'
          }
        },
        urgentIf: [
          'Severe chest pain',
          'Severe abdominal pain',
          'Severe head pain with vision changes',
          'Pain with signs of infection',
          'Pain after significant injury',
          'Pain with numbness or weakness'
        ]
      },
      
      diarrhea: {
        title: 'Diarrhea / Stomach Problems',
        icon: '🚽',
        symptoms: [
          'Loose or watery stools',
          'Frequent bowel movements',
          'Abdominal cramps',
          'Nausea or vomiting',
          'Bloating',
          'Fever with diarrhea'
        ],
        questions: [
          'How many loose stools have you had today?',
          'Do you have blood in your stool?',
          'Are you able to keep fluids down?',
          'Do you have fever?',
          'Are you feeling dizzy or weak?'
        ],
        advice: {
          mild: {
            en: 'Drink plenty of fluids (water, oral rehydration solution). Eat simple foods (rice, bananas, toast). Avoid dairy, fatty, or spicy foods. Rest. Seek help if symptoms worsen or persist over 3 days.',
            ar: 'اشرب الكثير من السوائل (الماء، محلول الإماهة الفموي). تناول الأطعمة البسيطة (الأرز، الموز، الخبز المحمص). تجنب منتجات الألبان والأطعمة الدهنية أو الحارة. استرح. اطلب المساعدة إذا ساءت الأعراض أو استمرت أكثر من 3 أيام.',
            fa: 'مایعات زیاد بنوشید (آب، محلول آبرسانی خوراکی). غذاهای ساده بخورید (برنج، موز، نان تست). از لبنیات، غذاهای چرب یا تند اجتناب کنید. استراحت کنید. اگر علائم بدتر شد یا بیش از 3 روز ادامه یافت، کمک بگیرید.'
          },
          urgent: {
            en: 'SEEK MEDICAL HELP! Severe dehydration or infection may be present requiring immediate treatment.',
            ar: 'اطلب المساعدة الطبية! قد يكون هناك جفاف شديد أو عدوى تتطلب علاجاً فورياً.',
            fa: 'کمک پزشکی بگیرید! ممکن است کم‌آبی شدید یا عفونت وجود داشته باشد که نیاز به درمان فوری دارد.'
          }
        },
        urgentIf: [
          'Blood in stool',
          'Signs of severe dehydration (dizziness, dry mouth, no urination)',
          'High fever with diarrhea',
          'Severe abdominal pain',
          'Persistent vomiting',
          'Symptoms lasting more than 3 days'
        ]
      },
      
      pregnancy: {
        title: 'Pregnancy-Related Issues',
        icon: '🤰',
        symptoms: [
          'Vaginal bleeding during pregnancy',
          'Severe abdominal pain',
          'Severe headache with vision changes',
          'Persistent vomiting',
          'Decreased fetal movement',
          'Signs of labor'
        ],
        questions: [
          'How many weeks pregnant are you?',
          'Are you having vaginal bleeding?',
          'Do you have severe abdominal pain?',
          'Are you having contractions?',
          'When did you last feel the baby move?'
        ],
        advice: {
          routine: {
            en: 'Regular prenatal care is important. Eat healthy foods, avoid alcohol and smoking. Take prenatal vitamins if available. Rest when tired. Seek medical care for any concerning symptoms.',
            ar: 'الرعاية المنتظمة قبل الولادة مهمة. تناولي الأطعمة الصحية، تجنبي الكحول والتدخين. تناولي فيتامينات ما قبل الولادة إن توفرت. استريحي عند التعب. اطلبي الرعاية الطبية لأي أعراض مقلقة.',
            fa: 'مراقبت‌های منظم بارداری مهم است. غذاهای سالم بخورید، از الکل و سیگار اجتناب کنید. در صورت وجود، ویتامین‌های بارداری مصرف کنید. هنگام خستگی استراحت کنید. برای هر علامت نگران‌کننده کمک پزشکی بگیرید.'
          },
          urgent: {
            en: 'SEEK IMMEDIATE MEDICAL HELP! Pregnancy complications can be life-threatening and require urgent medical attention.',
            ar: 'اطلبي المساعدة الطبية الفورية! مضاعفات الحمل يمكن أن تهدد الحياة وتتطلب عناية طبية عاجلة.',
            fa: 'فوراً کمک پزشکی بگیرید! عوارض بارداری می‌تواند تهدیدکننده زندگی باشد و نیاز به توجه پزشکی فوری دارد.'
          }
        },
        urgentIf: [
          'Any vaginal bleeding during pregnancy',
          'Severe headache with vision changes',
          'Severe abdominal pain',
          'Persistent vomiting (unable to keep fluids down)',
          'Signs of premature labor',
          'Sudden swelling of face, hands, or feet',
          'Decreased or absent fetal movement'
        ],
        urgent: true
      }
    };
    
    // Preventive care and health tips
    this.healthTips = {
      hygiene: {
        title: 'Basic Hygiene',
        tips: [
          'Wash hands frequently with soap and water for 20 seconds',
          'Use hand sanitizer if soap is not available',
          'Cover coughs and sneezes with elbow',
          'Avoid touching face with unwashed hands',
          'Keep living areas clean',
          'Brush teeth twice daily if possible'
        ]
      },
      nutrition: {
        title: 'Nutrition in Crisis',
        tips: [
          'Drink safe water (boiled, bottled, or treated)',
          'Eat cooked foods when possible',
          'Avoid raw or undercooked foods',
          'Eat fruits and vegetables if available',
          'Share food resources fairly in families',
          'Breastfeed infants if possible - it\'s the safest nutrition'
        ]
      },
      mental_health: {
        title: 'Mental Health',
        tips: [
          'Talk to trusted friends or family about your feelings',
          'Try to maintain daily routines',
          'Get physical activity when possible',
          'Practice deep breathing for stress',
          'Connect with community support',
          'Seek professional help for severe depression or anxiety'
        ]
      }
    };
  }

  getAdvice(condition) {
    const conditionData = this.conditions[condition];
    if (!conditionData) {
      return null;
    }

    const language = this.getCurrentLanguage();
    
    return {
      title: conditionData.title,
      icon: conditionData.icon,
      symptoms: conditionData.symptoms,
      questions: conditionData.questions,
      advice: this.getLocalizedAdvice(conditionData.advice, language),
      urgent: conditionData.urgent || false,
      urgentIf: conditionData.urgentIf || []
    };
  }

  getLocalizedAdvice(adviceObj, language) {
    const result = {};
    
    for (const [severity, translations] of Object.entries(adviceObj)) {
      result[severity] = translations[language] || translations.en;
    }
    
    return result;
  }

  getCurrentLanguage() {
    // Get user's preferred language from localStorage or default to English
    return localStorage.getItem('preferredLanguage') || 'en';
  }

  getAllConditions() {
    return Object.keys(this.conditions).map(key => ({
      key,
      title: this.conditions[key].title,
      icon: this.conditions[key].icon,
      urgent: this.conditions[key].urgent || false
    }));
  }

  getHealthTips(category) {
    const tipCategory = this.healthTips[category];
    if (!tipCategory) {
      return null;
    }

    return {
      title: tipCategory.title,
      tips: tipCategory.tips
    };
  }

  getAllHealthTips() {
    return Object.keys(this.healthTips).map(key => ({
      key,
      title: this.healthTips[key].title,
      tips: this.healthTips[key].tips
    }));
  }

  // Emergency medical phrases for quick access
  getEmergencyMedicalPhrases() {
    const language = this.getCurrentLanguage();
    
    const phrases = {
      help: {
        en: 'I need medical help',
        ar: 'أحتاج إلى مساعدة طبية',
        fa: 'به کمک پزشکی احتیاج دارم',
        ur: 'مجھے طبی مدد چاہیے'
      },
      pain: {
        en: 'I have severe pain here',
        ar: 'أشعر بألم شديد هنا',
        fa: 'اینجا درد شدید دارم',
        ur: 'مجھے یہاں شدید درد ہے'
      },
      breathing: {
        en: 'I cannot breathe properly',
        ar: 'لا أستطيع التنفس بشكل صحيح',
        fa: 'نمی‌توانم درست نفس بکشم',
        ur: 'میں صحیح طریقے سے سانس نہیں لے سکتا'
      },
      emergency: {
        en: 'This is a medical emergency',
        ar: 'هذه حالة طبية طارئة',
        fa: 'این یک اورژانس پزشکی است',
        ur: 'یہ طبی ایمرجنسی ہے'
      }
    };

    const result = [];
    for (const [key, translations] of Object.entries(phrases)) {
      result.push({
        key,
        text: translations[language] || translations.en,
        original: translations.en
      });
    }

    return result;
  }

  // Check if symptoms indicate urgent care needed
  assessUrgency(condition, userAnswers) {
    const conditionData = this.conditions[condition];
    if (!conditionData) {
      return { urgent: false, reason: 'Unknown condition' };
    }

    // If condition is marked as generally urgent
    if (conditionData.urgent) {
      return { 
        urgent: true, 
        reason: 'This condition typically requires immediate medical attention' 
      };
    }

    // Check specific urgent criteria
    if (conditionData.urgentIf && userAnswers) {
      for (const criteria of conditionData.urgentIf) {
        // Simple keyword matching - in a full app this would be more sophisticated
        const matchesUrgentCriteria = userAnswers.some(answer => 
          answer.toLowerCase().includes('yes') || 
          answer.toLowerCase().includes('severe') ||
          answer.toLowerCase().includes('high')
        );
        
        if (matchesUrgentCriteria) {
          return { 
            urgent: true, 
            reason: criteria 
          };
        }
      }
    }

    return { urgent: false, reason: 'Symptoms appear manageable with basic care' };
  }

  // Find nearby medical facilities (placeholder for integration with maps/location)
  findNearbyMedicalHelp(userLocation) {
    // In a real implementation, this would integrate with mapping services
    return {
      hospitals: [
        { name: 'Emergency Hospital', distance: '2.1 km', phone: 'Emergency: Call local emergency number' },
        { name: 'Community Health Center', distance: '3.5 km', phone: 'Contact local health authorities' }
      ],
      pharmacies: [
        { name: 'Local Pharmacy', distance: '0.8 km', phone: 'Ask locals for directions' }
      ],
      emergencyNumbers: {
        general: 'Ask locals for emergency number',
        medical: 'Ask locals for hospital number',
        poison: 'Ask locals for poison control'
      }
    };
  }
}

// Create singleton instance
window.MedicalGuide = MedicalGuide;
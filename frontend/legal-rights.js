// Legal Rights for Refugee Connect - Humanitarian Rights Guide
class LegalRights {
  constructor() {
    this.rights = {
      asylum: {
        title: 'Asylum Rights',
        icon: '🏛️',
        content: {
          en: {
            summary: "You have the right to seek asylum and have your case heard fairly.",
            tips: [
              "Register with UNHCR or local authorities immediately",
              "Keep all documents safe and make copies", 
              "Tell your story consistently and truthfully",
              "Ask for an interpreter if needed"
            ],
            warning: "Missing deadlines can harm your case. Never pay unofficial \"helpers\" who promise quick results.",
            phonetic: "\"I need asylum\""
          },
          fr: {
            summary: "Vous avez le droit de demander l'asile et d'avoir une audience équitable.",
            tips: [
              "Enregistrez-vous immédiatement auprès du HCR ou des autorités locales",
              "Gardez tous vos documents en sécurité et faites des copies",
              "Racontez votre histoire de manière cohérente et véridique", 
              "Demandez un interprète si nécessaire"
            ],
            warning: "Manquer les délais peut nuire à votre dossier. Ne payez jamais des \"assistants\" non officiels.",
            phonetic: "\"I need asylum\" = \"Aï nide euh-zaï-leume\""
          },
          ar: {
            summary: "لديك الحق في طلب اللجوء والحصول على جلسة استماع عادلة.",
            tips: [
              "سجل فوراً لدى المفوضية أو السلطات المحلية",
              "احتفظ بجميع الوثائق بأمان واصنع نسخاً",
              "اروِ قصتك بشكل متسق وصادق",
              "اطلب مترجماً إذا احتجت"
            ],
            warning: "تفويت المواعيد النهائية قد يضر بقضيتك. لا تدفع أبداً لـ\"مساعدين\" غير رسميين.",
            phonetic: "\"I need asylum\" = \"آي نيد أسايلم\""
          },
          ur: {
            summary: "آپ کو پناہ مانگنے اور منصفانہ سماعت کا حق حاصل ہے۔",
            tips: [
              "فوری طور پر UNHCR یا مقامی حکام کے پاس رجسٹر کریں",
              "تمام دستاویزات محفوظ رکھیں اور کاپیاں بنائیں",
              "اپنی کہانی مستقل اور سچائی سے بیان کریں",
              "ضرورت ہو تو مترجم طلب کریں"
            ],
            warning: "ڈیڈ لائن چھوڑنا آپ کے کیس کو نقصان پہنچا سکتا ہے۔ غیر سرکاری \"مددگاروں\" کو کبھی پیسے نہ دیں۔",
            phonetic: "\"I need asylum\" = \"آئی نیڈ اسائلم\""
          },
          ps: {
            summary: "تاسو د پناه غوښتلو او عادلانه اوریدنې حق لرئ.",
            tips: [
              "سمدستي د UNHCR یا محلي چارواکو سره راجستر شئ",
              "ټول اسناد خوندي وساتئ او کاپیانې جوړې کړئ",
              "خپله کیسه په ثابت او ریښتیني ډول ووایاست",
              "که اړتیا وي ژباړونکی وغواړئ"
            ],
            warning: "د مودې څخه تیریدل ستاسو قضیې ته زیان رسولی شي. غیر رسمي \"مرستندویانو\" ته پیسې مه ورکوئ.",
            phonetic: "\"I need asylum\" = \"آی نیډ اسایلم\""
          },
          es: {
            summary: "Tienes derecho a solicitar asilo y a una audiencia justa.",
            tips: [
              "Regístrate inmediatamente con ACNUR o autoridades locales",
              "Guarda todos los documentos de forma segura y haz copias",
              "Cuenta tu historia de manera consistente y veraz",
              "Solicita un intérprete si lo necesitas"
            ],
            warning: "Perder plazos puede dañar tu caso. Nunca pagues a \"ayudantes\" no oficiales.",
            phonetic: "\"I need asylum\" = \"Ai nid asáilom\""
          },
          so: {
            summary: "Waxaad xaq u leedahay inaad magangalyo codsato oo aad hesho dhageysiga caddaalad ah.",
            tips: [
              "Isla markiiba iska diiwaan geli UNHCR ama maamulka deegaanka",
              "Dukumentiyada oo dhan si ammaan ah u hay oo nuqullo ka samee",
              "Sheekadaada si joogto ah oo run ah u sheeg",
              "Waydiiso turjubaan haddii aad u baahato"
            ],
            warning: "Waqtiga ka dib tagiddu waxay dhaawici kartaa kiiskaaga. Weligaa lacag ha siin \"caawiyeyaal\" aan rasmi ahayn.",
            phonetic: "\"I need asylum\" = \"Aay niid asaaylam\""
          },
          zh: {
            summary: "您有权申请庇护并获得公正听证。",
            tips: [
              "立即向联合国难民署或当地部门登记",
              "妥善保管所有文件并复印",
              "一致且真实地讲述您的经历",
              "如需要可要求翻译"
            ],
            warning: "错过期限会损害您的案件。切勿向非官方\"帮助者\"付款。",
            phonetic: "\"I need asylum\" = \"爱 尼的 阿赛冷\""
          }
        }
      },

      detention: {
        title: 'If Detained',
        icon: '🔒',
        content: {
          en: {
            summary: "You cannot be detained arbitrarily and have rights even in detention.",
            tips: [
              "Ask why you are detained and for how long",
              "Request contact with UNHCR, your embassy, or a lawyer",
              "You have the right to medical care",
              "Keep track of detention documents"
            ],
            warning: "Signing documents you don't understand can waive important rights.",
            phonetic: "\"I want a lawyer\""
          },
          fr: {
            summary: "Vous ne pouvez pas être détenu arbitrairement et avez des droits même en détention.",
            tips: [
              "Demandez pourquoi vous êtes détenu et pour combien de temps",
              "Demandez à contacter le HCR, votre ambassade ou un avocat",
              "Vous avez droit aux soins médicaux",
              "Gardez trace des documents de détention"
            ],
            warning: "Signer des documents incompris peut renoncer à des droits importants.",
            phonetic: "\"I want a lawyer\" = \"Aï ouante euh lo-yeur\""
          },
          ar: {
            summary: "لا يمكن احتجازك تعسفياً ولديك حقوق حتى في الاحتجاز.",
            tips: [
              "اسأل عن سبب احتجازك والمدة",
              "اطلب الاتصال بالمفوضية أو سفارتك أو محامٍ",
              "لديك الحق في الرعاية الطبية",
              "احتفظ بسجل لوثائق الاحتجاز"
            ],
            warning: "توقيع وثائق لا تفهمها قد يسقط حقوقاً مهمة.",
            phonetic: "\"I want a lawyer\" = \"آي وانت أ لويَر\""
          },
          ur: {
            summary: "آپ کو من مانی طور پر حراست میں نہیں رکھا جا سکتا اور حراست میں بھی آپ کے حقوق ہیں۔",
            tips: [
              "پوچھیں کہ آپ کیوں اور کتنے عرصے کے لیے حراست میں ہیں",
              "UNHCR، سفارت خانے یا وکیل سے رابطہ طلب کریں",
              "آپ کو طبی امداد کا حق حاصل ہے",
              "حراست کی دستاویزات کا ریکارڈ رکھیں"
            ],
            warning: "جن دستاویزات کو آپ سمجھ نہیں پاتے ان پر دستخط کرنا اہم حقوق چھوڑ سکتا ہے۔",
            phonetic: "\"I want a lawyer\" = \"آئی وانٹ اے لائر\""
          },
          ps: {
            summary: "تاسو په خپل سري توګه نشئ توقیف کیدلی او په توقیف کې هم حقونه لرئ.",
            tips: [
              "وپوښتئ چې ولې او څومره وخت توقیف یاست",
              "د UNHCR، سفارت یا وکیل سره اړیکه وغواړئ",
              "تاسو د طبي پاملرنې حق لرئ",
              "د توقیف د اسنادو ریکارډ وساتئ"
            ],
            warning: "هغه اسناد لاسلیک کول چې نه پوهیږئ مهم حقونه له لاسه ورکولی شي.",
            phonetic: "\"I want a lawyer\" = \"آی وانټ اے لایر\""
          },
          es: {
            summary: "No puedes ser detenido arbitrariamente y tienes derechos incluso detenido.",
            tips: [
              "Pregunta por qué estás detenido y por cuánto tiempo",
              "Solicita contactar a ACNUR, tu embajada o un abogado",
              "Tienes derecho a atención médica",
              "Guarda registro de documentos de detención"
            ],
            warning: "Firmar documentos que no entiendes puede renunciar a derechos importantes.",
            phonetic: "\"I want a lawyer\" = \"Ai uánt a lóyer\""
          },
          so: {
            summary: "Laguma xiri karo si aan sharci ahayn, xataa xabsiga waxaad leedahay xuquuq.",
            tips: [
              "Waydiiso sababta loo xiray iyo mudada",
              "Codso inaad la xiriirto UNHCR, safaaradda ama qareen",
              "Waxaad xaq u leedahay daryeel caafimaad",
              "Hay dukumentiyada xabsiga"
            ],
            warning: "Saxiixida warqado aadan fahmin waxay luminaysaa xuquuq muhiim ah.",
            phonetic: "\"I want a lawyer\" = \"Aay want a looyar\""
          },
          zh: {
            summary: "您不能被任意拘留，即使被拘留也有权利。",
            tips: [
              "询问拘留原因和期限",
              "要求联系难民署、使馆或律师",
              "您有获得医疗的权利",
              "保存拘留文件记录"
            ],
            warning: "签署不理解的文件可能放弃重要权利。",
            phonetic: "\"I want a lawyer\" = \"爱 万特 阿 劳耶\""
          }
        }
      },

      interpreter: {
        title: 'Interpreter Rights',
        icon: '🗣️',
        content: {
          en: {
            summary: "You have the right to an interpreter in legal proceedings and important meetings.",
            tips: [
              "Always request an interpreter if you don't fully understand",
              "Ensure the interpreter speaks your exact dialect",
              "Ask for clarification if translation seems wrong",
              "Request a different interpreter if uncomfortable"
            ],
            warning: "Bad interpretation can seriously damage your case. Speak up immediately if there are problems.",
            phonetic: "\"I need an interpreter\""
          },
          fr: {
            summary: "Vous avez droit à un interprète lors des procédures légales et réunions importantes.",
            tips: [
              "Demandez toujours un interprète si vous ne comprenez pas parfaitement",
              "Assurez-vous que l'interprète parle votre dialecte exact",
              "Demandez des clarifications si la traduction semble incorrecte",
              "Demandez un autre interprète si mal à l'aise"
            ],
            warning: "Une mauvaise interprétation peut gravement nuire à votre dossier. Parlez immédiatement en cas de problème.",
            phonetic: "\"I need an interpreter\" = \"Aï nide an in-teur-pré-teur\""
          },
          ar: {
            summary: "لديك الحق في مترجم في الإجراءات القانونية والاجتماعات المهمة.",
            tips: [
              "اطلب دائماً مترجماً إذا لم تفهم تماماً",
              "تأكد أن المترجم يتحدث لهجتك بالضبط",
              "اطلب توضيحاً إذا بدت الترجمة خاطئة",
              "اطلب مترجماً آخر إذا شعرت بعدم الارتياح"
            ],
            warning: "الترجمة السيئة قد تضر بقضيتك بشدة. تحدث فوراً إذا كانت هناك مشاكل.",
            phonetic: "\"I need an interpreter\" = \"آي نيد آن إنتربريتر\""
          },
          ur: {
            summary: "قانونی کارروائیوں اور اہم میٹنگز میں آپ کو مترجم کا حق حاصل ہے۔",
            tips: [
              "اگر مکمل طور پر نہ سمجھیں تو ہمیشہ مترجم طلب کریں",
              "یقینی بنائیں کہ مترجم آپ کی مخصوص بولی بولتا ہے",
              "اگر ترجمہ غلط لگے تو وضاحت طلب کریں",
              "اگر بے چینی ہو تو دوسرا مترجم طلب کریں"
            ],
            warning: "غلط ترجمہ آپ کے کیس کو شدید نقصان پہنچا سکتا ہے۔ مسائل ہوں تو فوری بولیں۔",
            phonetic: "\"I need an interpreter\" = \"آئی نیڈ این انٹرپریٹر\""
          },
          ps: {
            summary: "تاسو په قانوني بهیرونو او مهمو غونډو کې د ژباړونکي حق لرئ.",
            tips: [
              "که بشپړ نه پوهیږئ نو تل ژباړونکی وغواړئ",
              "ډاډ ترلاسه کړئ چې ژباړونکی ستاسو دقیق ګړدود خبرې کوي",
              "که ژباړه غلطه ښکاري نو وضاحت وغواړئ",
              "که نا آرامه یاست نو بل ژباړونکی وغواړئ"
            ],
            warning: "بده ژباړه ستاسو قضیې ته جدي زیان رسولی شي. که ستونزې وي سمدستي وغږیږئ.",
            phonetic: "\"I need an interpreter\" = \"آی نیډ این انټرپریټر\""
          },
          es: {
            summary: "Tienes derecho a un intérprete en procedimientos legales y reuniones importantes.",
            tips: [
              "Siempre solicita intérprete si no entiendes completamente",
              "Asegúrate que el intérprete hable tu dialecto exacto",
              "Pide aclaración si la traducción parece incorrecta",
              "Solicita otro intérprete si te sientes incómodo"
            ],
            warning: "Una mala interpretación puede dañar seriamente tu caso. Habla inmediatamente si hay problemas.",
            phonetic: "\"I need an interpreter\" = \"Ai nid an intérpriter\""
          },
          so: {
            summary: "Waxaad xaq u leedahay turjubaan habka sharciga iyo kulamada muhiimka ah.",
            tips: [
              "Had iyo jeer codso turjubaan haddii aadan si buuxda u fahmin",
              "Hubi in turjubaanka uu ku hadlo lahjadaada saxda ah",
              "Waydiiso caddayn haddii tarjumaaddu khalad u muuqato",
              "Codso turjubaan kale haddii aad raaxo daremin"
            ],
            warning: "Tarjumaad xumo waxay kiiskaaga u geysan kartaa dhaawac weyn. Haddiiba hadal haddii dhibaato jirto.",
            phonetic: "\"I need an interpreter\" = \"Aay niid an intarpiritaar\""
          },
          zh: {
            summary: "您在法律程序和重要会议中有权获得口译员。",
            tips: [
              "如不完全理解，务必要求口译员",
              "确保口译员会说您的方言",
              "如翻译似有错误，要求澄清",
              "如感不适，要求更换口译员"
            ],
            warning: "错误翻译会严重损害您的案件。如有问题立即说出。",
            phonetic: "\"I need an interpreter\" = \"爱 尼的 安 因特普瑞特\""
          }
        }
      },

      children: {
        title: "Children's Rights",
        icon: '👶',
        content: {
          en: {
            summary: "Children have special protection rights including education, healthcare, and family unity.",
            tips: [
              "Register all children immediately with authorities",
              "Ensure children attend available schools",
              "Keep children's documents separate and safe",
              "Unaccompanied minors get special protection"
            ],
            warning: "Never leave children unregistered or undocumented. This risks separation and trafficking.",
            phonetic: "\"This is my child\""
          },
          fr: {
            summary: "Les enfants ont des droits spéciaux incluant éducation, santé et unité familiale.",
            tips: [
              "Enregistrez tous les enfants immédiatement auprès des autorités",
              "Assurez-vous que les enfants fréquentent les écoles disponibles",
              "Gardez les documents des enfants séparés et en sécurité",
              "Les mineurs non accompagnés ont une protection spéciale"
            ],
            warning: "Ne laissez jamais les enfants non enregistrés. Cela risque séparation et trafic.",
            phonetic: "\"This is my child\" = \"Ziss iz maï tchaïld\""
          },
          ar: {
            summary: "للأطفال حقوق حماية خاصة تشمل التعليم والرعاية الصحية ووحدة الأسرة.",
            tips: [
              "سجل جميع الأطفال فوراً لدى السلطات",
              "تأكد من حضور الأطفال للمدارس المتاحة",
              "احتفظ بوثائق الأطفال منفصلة وآمنة",
              "القُصّر غير المصحوبين لهم حماية خاصة"
            ],
            warning: "لا تترك الأطفال أبداً بدون تسجيل أو وثائق. هذا يخاطر بالفصل والاتجار.",
            phonetic: "\"This is my child\" = \"ذيس إز ماي تشايلد\""
          },
          ur: {
            summary: "بچوں کو خاص تحفظ کے حقوق حاصل ہیں جن میں تعلیم، صحت اور خاندانی اتحاد شامل ہے۔",
            tips: [
              "تمام بچوں کو فوری طور پر حکام کے پاس رجسٹر کریں",
              "یقینی بنائیں کہ بچے دستیاب اسکولوں میں جائیں",
              "بچوں کی دستاویزات الگ اور محفوظ رکھیں",
              "غیر ہمراہ نابالغوں کو خاص تحفظ ملتا ہے"
            ],
            warning: "بچوں کو کبھی غیر رجسٹرڈ یا بغیر دستاویزات نہ چھوڑیں۔ اس سے علیحدگی اور اسمگلنگ کا خطرہ ہے۔",
            phonetic: "\"This is my child\" = \"دس از مائی چائلڈ\""
          },
          ps: {
            summary: "ماشومان د ښوونې، روغتیا او کورنۍ یووالي په ګډون ځانګړي ساتنې حقونه لري.",
            tips: [
              "ټول ماشومان سمدستي د چارواکو سره راجستر کړئ",
              "ډاډ ترلاسه کړئ چې ماشومان شته ښوونځیو ته ځي",
              "د ماشومانو اسناد جلا او خوندي وساتئ",
              "بې سرپرسته کشران ځانګړې ساتنه ترلاسه کوي"
            ],
            warning: "ماشومان هیڅکله بې ثبته یا بې اسنادو مه پریږدئ. دا د جلاوالي او قاچاق خطر لري.",
            phonetic: "\"This is my child\" = \"دس از مای چایلډ\""
          },
          es: {
            summary: "Los niños tienen derechos especiales incluyendo educación, salud y unidad familiar.",
            tips: [
              "Registra a todos los niños inmediatamente con autoridades",
              "Asegura que los niños asistan a escuelas disponibles",
              "Guarda documentos de niños separados y seguros",
              "Menores no acompañados reciben protección especial"
            ],
            warning: "Nunca dejes niños sin registrar o documentar. Esto arriesga separación y tráfico.",
            phonetic: "\"This is my child\" = \"Dis is mai chaild\""
          },
          so: {
            summary: "Carruurtu waxay leeyihiin xuquuq gaar ah oo ay ku jiraan waxbarasho, caafimaad iyo midnimada qoyska.",
            tips: [
              "Dhammaan carruurta isla markiiba ka diiwaan geli maamulka",
              "Hubi in carruurtu tagaan dugsiyada jira",
              "Dukumentiyada carruurta gooni u hay oo ammaan u hay",
              "Carruurta aan waalid la socon waxay helaan ilaalin gaar ah"
            ],
            warning: "Weligaa carruurta ha ka tagin diiwaan la'aan. Tani waxay halis u tahay kala goynta iyo ka ganacsiga.",
            phonetic: "\"This is my child\" = \"Dis is maay chaayld\""
          },
          zh: {
            summary: "儿童享有特殊保护权，包括教育、医疗和家庭团聚。",
            tips: [
              "立即向当局登记所有儿童",
              "确保儿童就读可用学校",
              "分开安全保管儿童文件",
              "无人陪伴未成年人获特殊保护"
            ],
            warning: "切勿让儿童无登记或无证件。这有分离和贩卖风险。",
            phonetic: "\"This is my child\" = \"迪斯 伊斯 买 柴尔德\""
          }
        }
      },

      medical: {
        title: 'Medical Rights',
        icon: '🏥',
        content: {
          en: {
            summary: "You have the right to emergency medical care and basic health services.",
            tips: [
              "Seek immediate help for emergencies - it's your right",
              "Keep all medical records and prescriptions",
              "Ask about free clinics or NGO health services",
              "Pregnant women and children get priority care"
            ],
            warning: "Some facilities may try to deny services. Insist on emergency care - it's international law.",
            phonetic: "\"I need a doctor\""
          },
          fr: {
            summary: "Vous avez droit aux soins médicaux d'urgence et services de santé de base.",
            tips: [
              "Cherchez aide immédiate pour urgences - c'est votre droit",
              "Gardez tous dossiers médicaux et ordonnances",
              "Renseignez-vous sur cliniques gratuites ou services ONG",
              "Femmes enceintes et enfants ont priorité"
            ],
            warning: "Certains établissements peuvent refuser. Insistez sur soins d'urgence - c'est la loi internationale.",
            phonetic: "\"I need a doctor\" = \"Aï nide euh dok-teur\""
          },
          ar: {
            summary: "لديك الحق في الرعاية الطبية الطارئة والخدمات الصحية الأساسية.",
            tips: [
              "اطلب المساعدة الفورية للطوارئ - إنه حقك",
              "احتفظ بجميع السجلات الطبية والوصفات",
              "اسأل عن العيادات المجانية أو خدمات المنظمات",
              "النساء الحوامل والأطفال لهم الأولوية"
            ],
            warning: "قد تحاول بعض المنشآت رفض الخدمات. أصر على الرعاية الطارئة - إنه القانون الدولي.",
            phonetic: "\"I need a doctor\" = \"آي نيد أ دوكتور\""
          },
          ur: {
            summary: "آپ کو ہنگامی طبی امداد اور بنیادی صحت خدمات کا حق حاصل ہے۔",
            tips: [
              "ہنگامی حالات میں فوری مدد طلب کریں - یہ آپ کا حق ہے",
              "تمام طبی ریکارڈ اور نسخے محفوظ رکھیں",
              "مفت کلینک یا NGO صحت خدمات کے بارے میں پوچھیں",
              "حاملہ خواتین اور بچوں کو ترجیح ملتی ہے"
            ],
            warning: "کچھ ادارے خدمات سے انکار کر سکتے ہیں۔ ہنگامی امداد پر اصرار کریں - یہ بین الاقوامی قانون ہے۔",
            phonetic: "\"I need a doctor\" = \"آئی نیڈ اے ڈاکٹر\""
          },
          ps: {
            summary: "تاسو د بیړني طبي پاملرنې او بنسټیزو روغتیایي خدماتو حق لرئ.",
            tips: [
              "د بیړنیو حالاتو لپاره سمدستي مرسته وغواړئ - دا ستاسو حق دی",
              "ټول طبي ریکارډونه او نسخې وساتئ",
              "د وړیا کلینیکونو یا NGO روغتیا خدماتو په اړه وپوښتئ",
              "امیندوارې ښځې او ماشومان لومړیتوب لري"
            ],
            warning: "ځینې تاسیسات کیدای شي خدمات رد کړي. په بیړني پاملرنې ټینګار وکړئ - دا نړیوال قانون دی.",
            phonetic: "\"I need a doctor\" = \"آی نیډ اے ډاکټر\""
          },
          es: {
            summary: "Tienes derecho a atención médica de emergencia y servicios básicos de salud.",
            tips: [
              "Busca ayuda inmediata en emergencias - es tu derecho",
              "Guarda todos los registros médicos y recetas",
              "Pregunta por clínicas gratuitas o servicios de ONGs",
              "Mujeres embarazadas y niños tienen prioridad"
            ],
            warning: "Algunos centros pueden negar servicios. Insiste en atención de emergencia - es ley internacional.",
            phonetic: "\"I need a doctor\" = \"Ai nid a dóctor\""
          },
          so: {
            summary: "Waxaad xaq u leedahay daryeel caafimaad degdeg ah iyo adeegyada caafimaad aasaasiga ah.",
            tips: [
              "Xaaladaha degdega ah isla markiiba caawimaad raadso - waa xaqaaga",
              "Dhammaan diiwaanada caafimaad iyo dawooyinka hay",
              "Waydiiso kiliinikada bilaashka ah ama adeegyada NGO-yada",
              "Haweenka uurka leh iyo carruurtu mudnaan bay leeyihiin"
            ],
            warning: "Xarumaha qaar waxay isku dayi karaan inay diidaan. Ku adkayso daryeelka degdega - waa sharciga caalamiga.",
            phonetic: "\"I need a doctor\" = \"Aay niid a doktar\""
          },
          zh: {
            summary: "您有权获得紧急医疗和基本卫生服务。",
            tips: [
              "紧急情况立即求助 - 这是您的权利",
              "保存所有医疗记录和处方",
              "询问免费诊所或NGO医疗服务",
              "孕妇和儿童优先照顾"
            ],
            warning: "某些机构可能拒绝服务。坚持急诊护理 - 这是国际法。",
            phonetic: "\"I need a doctor\" = \"爱 尼的 阿 达克特\""
          }
        }
      },

      legal: {
        title: 'Legal Aid',
        icon: '⚖️',
        content: {
          en: {
            summary: "You have the right to legal assistance and advice about your case.",
            tips: [
              "Contact UNHCR or legal aid organizations immediately",
              "Many NGOs provide free legal services",
              "Keep copies of all legal documents",
              "Never sign anything without legal advice"
            ],
            warning: "Fake lawyers may charge money for bad advice. Verify credentials with official organizations.",
            phonetic: "\"I need legal help\""
          },
          fr: {
            summary: "Vous avez droit à l'assistance juridique et conseils sur votre dossier.",
            tips: [
              "Contactez immédiatement le HCR ou organisations d'aide juridique",
              "Beaucoup d'ONG offrent services juridiques gratuits",
              "Gardez copies de tous documents juridiques",
              "Ne signez jamais rien sans conseil juridique"
            ],
            warning: "Faux avocats peuvent demander argent pour mauvais conseils. Vérifiez accréditations avec organisations officielles.",
            phonetic: "\"I need legal help\" = \"Aï nide li-gal elp\""
          },
          ar: {
            summary: "لديك الحق في المساعدة القانونية والمشورة حول قضيتك.",
            tips: [
              "اتصل فوراً بالمفوضية أو منظمات المساعدة القانونية",
              "كثير من المنظمات تقدم خدمات قانونية مجانية",
              "احتفظ بنسخ من جميع الوثائق القانونية",
              "لا توقع أبداً أي شيء بدون استشارة قانونية"
            ],
            warning: "المحامون المزيفون قد يطلبون المال مقابل نصائح سيئة. تحقق من الاعتماد مع المنظمات الرسمية.",
            phonetic: "\"I need legal help\" = \"آي نيد ليغال هيلب\""
          },
          ur: {
            summary: "آپ کو اپنے کیس کے بارے میں قانونی مدد اور مشورے کا حق حاصل ہے۔",
            tips: [
              "فوری طور پر UNHCR یا قانونی امداد تنظیموں سے رابطہ کریں",
              "بہت سی NGOs مفت قانونی خدمات فراہم کرتی ہیں",
              "تمام قانونی دستاویزات کی کاپیاں رکھیں",
              "قانونی مشورے کے بغیر کبھی کچھ دستخط نہ کریں"
            ],
            warning: "جعلی وکیل غلط مشورے کے لیے پیسے مانگ سکتے ہیں۔ سرکاری تنظیموں سے اسناد کی تصدیق کریں۔",
            phonetic: "\"I need legal help\" = \"آئی نیڈ لیگل ہیلپ\""
          },
          ps: {
            summary: "تاسو د خپلې قضیې په اړه د حقوقي مرستې او مشورې حق لرئ.",
            tips: [
              "سمدستي د UNHCR یا حقوقي مرستې سازمانونو سره اړیکه ونیسئ",
              "ډیری NGOs وړیا حقوقي خدمات وړاندې کوي",
              "د ټولو حقوقي اسنادو کاپیانې وساتئ",
              "د حقوقي مشورې پرته هیڅکله څه لاسلیک مه کوئ"
            ],
            warning: "جعلي وکیلان کیدای شي د بدې مشورې لپاره پیسې واخلي. د رسمي سازمانونو سره اسناد تایید کړئ.",
            phonetic: "\"I need legal help\" = \"آی نیډ لیګل هیلپ\""
          },
          es: {
            summary: "Tienes derecho a asistencia legal y asesoría sobre tu caso.",
            tips: [
              "Contacta inmediatamente a ACNUR u organizaciones de ayuda legal",
              "Muchas ONGs proveen servicios legales gratuitos",
              "Guarda copias de todos los documentos legales",
              "Nunca firmes nada sin asesoría legal"
            ],
            warning: "Abogados falsos pueden cobrar por mal asesoramiento. Verifica credenciales con organizaciones oficiales.",
            phonetic: "\"I need legal help\" = \"Ai nid lígal jelp\""
          },
          so: {
            summary: "Waxaad xaq u leedahay caawimaad sharci iyo talo ku saabsan kiiskaaga.",
            tips: [
              "Isla markiiba la xiriir UNHCR ama ururada caawimaadda sharciga",
              "NGO-yo badan waxay bixiyaan adeegyo sharci oo bilaash ah",
              "Hay nuqullo ka mid ah dhammaan dukumentiyada sharciga",
              "Weligaa waxba ha saxiixin talo sharci la'aan"
            ],
            warning: "Qareenada beenta ah waxay lacag ku weydiin karaan talo xun. Xaqiiji aqoonsiga ururada rasmiga ah.",
            phonetic: "\"I need legal help\" = \"Aay niid liigal help\""
          },
          zh: {
            summary: "您有权获得法律援助和案件咨询。",
            tips: [
              "立即联系难民署或法律援助组织",
              "许多NGO提供免费法律服务",
              "保存所有法律文件副本",
              "没有法律建议切勿签署任何文件"
            ],
            warning: "假律师可能收钱提供错误建议。向官方组织核实资格。",
            phonetic: "\"I need legal help\" = \"爱 尼的 利够 赫尔普\""
          }
        }
      }
    };

    this.contacts = {
      unhcr: "UNHCR Global: www.unhcr.org",
      emergency: "Emergency Hotline: Varies by country - ask local UNHCR office",
      redcross: "Red Cross/Red Crescent: Contact local chapter",
      iom: "IOM (International Organization for Migration): www.iom.int"
    };

    this.coreRights = [
      "Non-refoulement: You cannot be returned to danger",
      "Non-discrimination: Equal treatment regardless of race, religion, or nationality",
      "Family unity: Right to stay with family members", 
      "Documentation: Right to identity documents",
      "Freedom of movement: Within legal limits of host country",
      "Access to courts: Right to legal remedies"
    ];

    this.currentLanguage = 'en';
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.render();
  }

  getAvailableLanguages() {
    return {
      'en': 'English',
      'fr': 'Français', 
      'ar': 'العربية',
      'ur': 'اردو',
      'ps': 'پښتو',
      'es': 'Español',
      'so': 'Soomaali',
      'zh': '中文'
    };
  }

  render() {
    const container = document.getElementById('legalRightsContent');
    if (!container) return;

    const languages = this.getAvailableLanguages();
    
    let html = `
      <div class="legal-rights-header">
        <h2>🏛️ Legal Rights Guide</h2>
        <div class="language-selector">
          <select id="languageSelect" onchange="legalRights.setLanguage(this.value)">
            ${Object.entries(languages).map(([code, name]) => 
              `<option value="${code}" ${code === this.currentLanguage ? 'selected' : ''}>${name}</option>`
            ).join('')}
          </select>
        </div>
      </div>

      <div class="rights-grid">
        ${Object.entries(this.rights).map(([key, right]) => {
          const content = right.content[this.currentLanguage] || right.content.en;
          return `
            <div class="right-card">
              <div class="right-header">
                <span class="right-icon">${right.icon}</span>
                <h3>${right.title}</h3>
              </div>
              <div class="right-content">
                <div class="right-summary">
                  <strong>Right Summary:</strong> ${content.summary}
                </div>
                <div class="right-tips">
                  <strong>Practical Tips:</strong>
                  <ul>
                    ${content.tips.map(tip => `<li>${tip}</li>`).join('')}
                  </ul>
                </div>
                <div class="right-warning">
                  <strong>⚠️ Watch Out:</strong> ${content.warning}
                </div>
                <div class="right-phonetic">
                  <strong>🗣️ Phonetic Help:</strong> ${content.phonetic}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="important-contacts">
        <h3>📞 Important Contacts</h3>
        <ul>
          ${Object.values(this.contacts).map(contact => `<li>${contact}</li>`).join('')}
        </ul>
      </div>

      <div class="core-rights">
        <h3>🔑 Remember Your Rights</h3>
        <ul>
          ${this.coreRights.map(right => `<li>${right}</li>`).join('')}
        </ul>
      </div>

      <div class="disclaimer">
        <p><em>This guide provides general information. Local laws and procedures may vary. Always seek specific legal advice for your situation.</em></p>
      </div>
    `;

    container.innerHTML = html;
  }

  getRights(rightType) {
    return this.rights[rightType] || null;
  }

  init() {
    this.render();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.legalRights = new LegalRights();
  legalRights.init();
});
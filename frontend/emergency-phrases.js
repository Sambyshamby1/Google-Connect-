// Emergency Phrases for Refugee Connect
class EmergencyPhrases {
  constructor() {
    // 50+ critical survival phrases in 10 languages
    this.phrases = {
      // Emergency/Crisis
      help: {
        en: 'Help!',
        ar: 'مساعدة!',
        fa: 'کمک!',
        ur: 'مدد!',
        ps: 'مرسته!',
        fr: 'Au secours!',
        de: 'Hilfe!',
        es: '¡Ayuda!',
        tr: 'Yardım!',
        so: 'Caawin!'
      },
      emergency: {
        en: 'Emergency!',
        ar: 'طوارئ!',
        fa: 'اورژانس!',
        ur: 'ایمرجنسی!',
        ps: 'بیړنۍ!',
        fr: 'Urgence!',
        de: 'Notfall!',
        es: '¡Emergencia!',
        tr: 'Acil durum!',
        so: 'Xaalad degdeg ah!'
      },
      danger: {
        en: 'Danger!',
        ar: 'خطر!',
        fa: 'خطر!',
        ur: 'خطرہ!',
        ps: 'خطر!',
        fr: 'Danger!',
        de: 'Gefahr!',
        es: '¡Peligro!',
        tr: 'Tehlike!',
        so: 'Khatar!'
      },
      fire: {
        en: 'Fire!',
        ar: 'حريق!',
        fa: 'آتش!',
        ur: 'آگ!',
        ps: 'اور!',
        fr: 'Feu!',
        de: 'Feuer!',
        es: '¡Fuego!',
        tr: 'Yangın!',
        so: 'Dab!'
      },
      police: {
        en: 'Call the police!',
        ar: 'اتصل بالشرطة!',
        fa: 'به پلیس زنگ بزنید!',
        ur: 'پولیس کو بلائیں!',
        ps: 'پولیسو ته زنګ ووهئ!',
        fr: 'Appelez la police!',
        de: 'Rufen Sie die Polizei!',
        es: '¡Llame a la policía!',
        tr: 'Polisi arayın!',
        so: 'Wac booliiska!'
      },
      
      // Medical Emergency
      doctor: {
        en: 'I need a doctor',
        ar: 'أحتاج إلى طبيب',
        fa: 'به دکتر احتیاج دارم',
        ur: 'مجھے ڈاکٹر کی ضرورت ہے',
        ps: 'زه ډاکټر ته اړتیا لرم',
        fr: "J'ai besoin d'un médecin",
        de: 'Ich brauche einen Arzt',
        es: 'Necesito un médico',
        tr: 'Doktora ihtiyacım var',
        so: 'Waxaan u baahnahay dhakhtar'
      },
      hospital: {
        en: 'Where is the hospital?',
        ar: 'أين المستشفى؟',
        fa: 'بیمارستان کجاست؟',
        ur: 'ہسپتال کہاں ہے؟',
        ps: 'روغتون چیرته دی؟',
        fr: "Où est l'hôpital?",
        de: 'Wo ist das Krankenhaus?',
        es: '¿Dónde está el hospital?',
        tr: 'Hastane nerede?',
        so: 'Xaggee cusbitaalka?'
      },
      hurt: {
        en: 'I am hurt',
        ar: 'أنا مصاب',
        fa: 'من زخمی شده‌ام',
        ur: 'میں زخمی ہوں',
        ps: 'زه ټپي یم',
        fr: 'Je suis blessé',
        de: 'Ich bin verletzt',
        es: 'Estoy herido',
        tr: 'Yaralıyım',
        so: 'Waan dhaawacmay'
      },
      pain: {
        en: 'I have pain here',
        ar: 'أشعر بألم هنا',
        fa: 'اینجا درد دارم',
        ur: 'مجھے یہاں درد ہے',
        ps: 'دلته درد لرم',
        fr: "J'ai mal ici",
        de: 'Ich habe hier Schmerzen',
        es: 'Tengo dolor aquí',
        tr: 'Burada ağrım var',
        so: 'Halkan ayaa i xanuunaya'
      },
      medicine: {
        en: 'I need medicine',
        ar: 'أحتاج إلى دواء',
        fa: 'به دارو احتیاج دارم',
        ur: 'مجھے دوا چاہیے',
        ps: 'زه درملو ته اړتیا لرم',
        fr: "J'ai besoin de médicaments",
        de: 'Ich brauche Medizin',
        es: 'Necesito medicina',
        tr: 'İlaca ihtiyacım var',
        so: 'Waxaan u baahnahay dawo'
      },
      pregnant: {
        en: 'I am pregnant',
        ar: 'أنا حامل',
        fa: 'من باردار هستم',
        ur: 'میں حاملہ ہوں',
        ps: 'زه امیدواره یم',
        fr: 'Je suis enceinte',
        de: 'Ich bin schwanger',
        es: 'Estoy embarazada',
        tr: 'Hamileyim',
        so: 'Waan uurka leeyahay'
      },
      allergic: {
        en: 'I am allergic to...',
        ar: 'لدي حساسية من...',
        fa: 'من به ... حساسیت دارم',
        ur: 'مجھے ... سے الرجی ہے',
        ps: 'زه د ... څخه حساسیت لرم',
        fr: 'Je suis allergique à...',
        de: 'Ich bin allergisch gegen...',
        es: 'Soy alérgico a...',
        tr: '...alerjim var',
        so: 'Waxaan xasaasiyad u leeyahay...'
      },
      
      // Legal/Asylum
      asylum: {
        en: 'I need asylum',
        ar: 'أحتاج إلى اللجوء',
        fa: 'به پناهندگی احتیاج دارم',
        ur: 'مجھے پناہ چاہیے',
        ps: 'زه پناه غواړم',
        fr: "J'ai besoin d'asile",
        de: 'Ich brauche Asyl',
        es: 'Necesito asilo',
        tr: 'Sığınmaya ihtiyacım var',
        so: 'Waxaan u baahnahay magangalyo'
      },
      refugee: {
        en: 'I am a refugee',
        ar: 'أنا لاجئ',
        fa: 'من پناهنده هستم',
        ur: 'میں مہاجر ہوں',
        ps: 'زه کډوال یم',
        fr: 'Je suis réfugié',
        de: 'Ich bin Flüchtling',
        es: 'Soy refugiado',
        tr: 'Ben mülteciyim',
        so: 'Waxaan ahay qaxooti'
      },
      lawyer: {
        en: 'I need a lawyer',
        ar: 'أحتاج إلى محامي',
        fa: 'به وکیل احتیاج دارم',
        ur: 'مجھے وکیل چاہیے',
        ps: 'زه څارنوال ته اړتیا لرم',
        fr: "J'ai besoin d'un avocat",
        de: 'Ich brauche einen Anwalt',
        es: 'Necesito un abogado',
        tr: 'Avukata ihtiyacım var',
        so: 'Waxaan u baahnahay qareen'
      },
      rights: {
        en: 'I have rights',
        ar: 'لدي حقوق',
        fa: 'من حقوق دارم',
        ur: 'میرے حقوق ہیں',
        ps: 'زه حقونه لرم',
        fr: "J'ai des droits",
        de: 'Ich habe Rechte',
        es: 'Tengo derechos',
        tr: 'Haklarım var',
        so: 'Waxaan leeyahay xuquuq'
      },
      embassy: {
        en: 'Contact my embassy',
        ar: 'اتصل بسفارتي',
        fa: 'با سفارت من تماس بگیرید',
        ur: 'میری سفارت سے رابطہ کریں',
        ps: 'زما له سفارت سره اړیکه ونیسئ',
        fr: 'Contactez mon ambassade',
        de: 'Kontaktieren Sie meine Botschaft',
        es: 'Contacte mi embajada',
        tr: 'Konsolosluğuma haber verin',
        so: 'La xiriir safaaradayda'
      },
      
      // Basic Needs
      water: {
        en: 'Water',
        ar: 'ماء',
        fa: 'آب',
        ur: 'پانی',
        ps: 'اوبه',
        fr: 'Eau',
        de: 'Wasser',
        es: 'Agua',
        tr: 'Su',
        so: 'Biyo'
      },
      food: {
        en: 'Food',
        ar: 'طعام',
        fa: 'غذا',
        ur: 'کھانا',
        ps: 'خواړه',
        fr: 'Nourriture',
        de: 'Essen',
        es: 'Comida',
        tr: 'Yemek',
        so: 'Cunto'
      },
      hungry: {
        en: 'I am hungry',
        ar: 'أنا جائع',
        fa: 'من گرسنه هستم',
        ur: 'مجھے بھوک لگی ہے',
        ps: 'زه وږی یم',
        fr: "J'ai faim",
        de: 'Ich habe Hunger',
        es: 'Tengo hambre',
        tr: 'Açım',
        so: 'Waan gaajoonayaa'
      },
      thirsty: {
        en: 'I am thirsty',
        ar: 'أنا عطشان',
        fa: 'من تشنه هستم',
        ur: 'مجھے پیاس لگی ہے',
        ps: 'زه تږی یم',
        fr: "J'ai soif",
        de: 'Ich habe Durst',
        es: 'Tengo sed',
        tr: 'Susadım',
        so: 'Waan oomahay'
      },
      bathroom: {
        en: 'Where is the bathroom?',
        ar: 'أين الحمام؟',
        fa: 'دستشویی کجاست؟',
        ur: 'باتھ روم کہاں ہے؟',
        ps: 'تشناب چیرته دی؟',
        fr: 'Où sont les toilettes?',
        de: 'Wo ist die Toilette?',
        es: '¿Dónde está el baño?',
        tr: 'Tuvalet nerede?',
        so: 'Xaggee musqusha?'
      },
      shelter: {
        en: 'I need shelter',
        ar: 'أحتاج إلى مأوى',
        fa: 'به سرپناه احتیاج دارم',
        ur: 'مجھے پناہ گاہ چاہیے',
        ps: 'زه سرپناه ته اړتیا لرم',
        fr: "J'ai besoin d'un abri",
        de: 'Ich brauche Unterkunft',
        es: 'Necesito refugio',
        tr: 'Barınağa ihtiyacım var',
        so: 'Waxaan u baahnahay hoy'
      },
      cold: {
        en: 'I am cold',
        ar: 'أشعر بالبرد',
        fa: 'سردم است',
        ur: 'مجھے سردی لگ رہی ہے',
        ps: 'زه یخ یم',
        fr: "J'ai froid",
        de: 'Mir ist kalt',
        es: 'Tengo frío',
        tr: 'Üşüyorum',
        so: 'Waan qaboobay'
      },
      blanket: {
        en: 'I need a blanket',
        ar: 'أحتاج إلى بطانية',
        fa: 'به پتو احتیاج دارم',
        ur: 'مجھے کمبل چاہیے',
        ps: 'زه کمپلې ته اړتیا لرم',
        fr: "J'ai besoin d'une couverture",
        de: 'Ich brauche eine Decke',
        es: 'Necesito una manta',
        tr: 'Battaniyeye ihtiyacım var',
        so: 'Waxaan u baahnahay buste'
      },
      
      // Communication
      understand: {
        en: "I don't understand",
        ar: 'لا أفهم',
        fa: 'نمی‌فهمم',
        ur: 'میں نہیں سمجھتا',
        ps: 'زه نه پوهیږم',
        fr: 'Je ne comprends pas',
        de: 'Ich verstehe nicht',
        es: 'No entiendo',
        tr: 'Anlamıyorum',
        so: 'Ma fahmin'
      },
      speak: {
        en: "I don't speak...",
        ar: 'لا أتحدث...',
        fa: 'من ... صحبت نمی‌کنم',
        ur: 'میں ... نہیں بولتا',
        ps: 'زه ... نه وایم',
        fr: 'Je ne parle pas...',
        de: 'Ich spreche kein...',
        es: 'No hablo...',
        tr: '...konuşmuyorum',
        so: 'Ma ku hadlo...'
      },
      translator: {
        en: 'I need a translator',
        ar: 'أحتاج إلى مترجم',
        fa: 'به مترجم احتیاج دارم',
        ur: 'مجھے مترجم چاہیے',
        ps: 'زه ژباړونکي ته اړتیا لرم',
        fr: "J'ai besoin d'un traducteur",
        de: 'Ich brauche einen Übersetzer',
        es: 'Necesito un traductor',
        tr: 'Tercümana ihtiyacım var',
        so: 'Waxaan u baahnahay turjubaan'
      },
      phone: {
        en: 'Can I use a phone?',
        ar: 'هل يمكنني استخدام الهاتف؟',
        fa: 'آیا می‌توانم از تلفن استفاده کنم؟',
        ur: 'کیا میں فون استعمال کر سکتا ہوں؟',
        ps: 'ایا زه ټیلیفون کارولی شم؟',
        fr: 'Puis-je utiliser un téléphone?',
        de: 'Kann ich ein Telefon benutzen?',
        es: '¿Puedo usar un teléfono?',
        tr: 'Telefon kullanabilir miyim?',
        so: 'Ma isticmaali karaa telefoon?'
      },
      
      // Family
      family: {
        en: 'My family',
        ar: 'عائلتي',
        fa: 'خانواده من',
        ur: 'میرا خاندان',
        ps: 'زما کورنۍ',
        fr: 'Ma famille',
        de: 'Meine Familie',
        es: 'Mi familia',
        tr: 'Ailem',
        so: 'Qoyskaygii'
      },
      children: {
        en: 'My children',
        ar: 'أطفالي',
        fa: 'فرزندانم',
        ur: 'میرے بچے',
        ps: 'زما ماشومان',
        fr: 'Mes enfants',
        de: 'Meine Kinder',
        es: 'Mis hijos',
        tr: 'Çocuklarım',
        so: 'Carruurtayda'
      },
      lost: {
        en: 'I am lost',
        ar: 'أنا ضائع',
        fa: 'گم شده‌ام',
        ur: 'میں گم ہو گیا ہوں',
        ps: 'زه ورک شوی یم',
        fr: 'Je suis perdu',
        de: 'Ich habe mich verlaufen',
        es: 'Estoy perdido',
        tr: 'Kayboldum',
        so: 'Waan lunsaday'
      },
      separated: {
        en: 'I am separated from my family',
        ar: 'أنا منفصل عن عائلتي',
        fa: 'از خانواده‌ام جدا شده‌ام',
        ur: 'میں اپنے خاندان سے جدا ہوں',
        ps: 'زه له خپلې کورنۍ څخه جلا شوی یم',
        fr: 'Je suis séparé de ma famille',
        de: 'Ich bin von meiner Familie getrennt',
        es: 'Estoy separado de mi familia',
        tr: 'Ailemden ayrıyım',
        so: 'Waan ka soocday qoyskayga'
      },
      
      // Safety
      safe: {
        en: 'Am I safe here?',
        ar: 'هل أنا آمن هنا؟',
        fa: 'آیا اینجا امن هستم؟',
        ur: 'کیا میں یہاں محفوظ ہوں؟',
        ps: 'ایا زه دلته خوندي یم؟',
        fr: 'Suis-je en sécurité ici?',
        de: 'Bin ich hier sicher?',
        es: '¿Estoy seguro aquí?',
        tr: 'Burada güvende miyim?',
        so: 'Ma halkan ammaan baan ku ahay?'
      },
      afraid: {
        en: 'I am afraid',
        ar: 'أنا خائف',
        fa: 'من می‌ترسم',
        ur: 'مجھے ڈر لگ رہا ہے',
        ps: 'زه ویریږم',
        fr: "J'ai peur",
        de: 'Ich habe Angst',
        es: 'Tengo miedo',
        tr: 'Korkuyorum',
        so: 'Waan cabsanayaa'
      },
      threat: {
        en: 'Someone threatened me',
        ar: 'شخص ما هددني',
        fa: 'کسی مرا تهدید کرد',
        ur: 'کسی نے مجھے دھمکی دی',
        ps: 'یو چا ما ته ګواښ وکړ',
        fr: "Quelqu'un m'a menacé",
        de: 'Jemand hat mich bedroht',
        es: 'Alguien me amenazó',
        tr: 'Biri beni tehdit etti',
        so: 'Qof baa i hanjabay'
      },
      
      // Documents
      passport: {
        en: 'I have lost my passport',
        ar: 'لقد فقدت جواز سفري',
        fa: 'پاسپورتم را گم کرده‌ام',
        ur: 'میرا پاسپورٹ گم ہو گیا ہے',
        ps: 'زما پاسپورټ ورک شوی دی',
        fr: "J'ai perdu mon passeport",
        de: 'Ich habe meinen Pass verloren',
        es: 'He perdido mi pasaporte',
        tr: 'Pasaportumu kaybettim',
        so: 'Waxaan lumiyay baasaboorkaygii'
      },
      documents: {
        en: 'My documents',
        ar: 'وثائقي',
        fa: 'مدارک من',
        ur: 'میرے کاغذات',
        ps: 'زما اسناد',
        fr: 'Mes documents',
        de: 'Meine Dokumente',
        es: 'Mis documentos',
        tr: 'Belgelerim',
        so: 'Dukumiintiyadeydii'
      },
      identity: {
        en: 'This is my identity',
        ar: 'هذه هويتي',
        fa: 'این هویت من است',
        ur: 'یہ میری شناخت ہے',
        ps: 'دا زما پیژندنه ده',
        fr: 'Ceci est mon identité',
        de: 'Das ist meine Identität',
        es: 'Esta es mi identidad',
        tr: 'Bu benim kimliğim',
        so: 'Tani waa aqoonsigayga'
      },
      
      // Money/Resources
      money: {
        en: 'I have no money',
        ar: 'ليس لدي نقود',
        fa: 'پول ندارم',
        ur: 'میرے پاس پیسے نہیں ہیں',
        ps: 'زه پیسې نه لرم',
        fr: "Je n'ai pas d'argent",
        de: 'Ich habe kein Geld',
        es: 'No tengo dinero',
        tr: 'Param yok',
        so: 'Lacag ma lihi'
      },
      work: {
        en: 'I need work',
        ar: 'أحتاج إلى عمل',
        fa: 'به کار احتیاج دارم',
        ur: 'مجھے کام چاہیے',
        ps: 'زه کار ته اړتیا لرم',
        fr: "J'ai besoin de travail",
        de: 'Ich brauche Arbeit',
        es: 'Necesito trabajo',
        tr: 'İşe ihtiyacım var',
        so: 'Waxaan u baahnahay shaqo'
      },
      
      // Direction/Location
      where: {
        en: 'Where is...?',
        ar: 'أين...؟',
        fa: '... کجاست؟',
        ur: '... کہاں ہے؟',
        ps: '... چیرته دی؟',
        fr: 'Où est...?',
        de: 'Wo ist...?',
        es: '¿Dónde está...?',
        tr: '...nerede?',
        so: 'Xaggee...?'
      },
      here: {
        en: 'Here',
        ar: 'هنا',
        fa: 'اینجا',
        ur: 'یہاں',
        ps: 'دلته',
        fr: 'Ici',
        de: 'Hier',
        es: 'Aquí',
        tr: 'Burada',
        so: 'Halkan'
      },
      there: {
        en: 'There',
        ar: 'هناك',
        fa: 'آنجا',
        ur: 'وہاں',
        ps: 'هلته',
        fr: 'Là',
        de: 'Dort',
        es: 'Allí',
        tr: 'Orada',
        so: 'Halkaas'
      },
      
      // Basic Communication
      yes: {
        en: 'Yes',
        ar: 'نعم',
        fa: 'بله',
        ur: 'جی ہاں',
        ps: 'هو',
        fr: 'Oui',
        de: 'Ja',
        es: 'Sí',
        tr: 'Evet',
        so: 'Haa'
      },
      no: {
        en: 'No',
        ar: 'لا',
        fa: 'نه',
        ur: 'نہیں',
        ps: 'نه',
        fr: 'Non',
        de: 'Nein',
        es: 'No',
        tr: 'Hayır',
        so: 'Maya'
      },
      please: {
        en: 'Please',
        ar: 'من فضلك',
        fa: 'لطفاً',
        ur: 'براہ کرم',
        ps: 'مهرباني',
        fr: "S'il vous plaît",
        de: 'Bitte',
        es: 'Por favor',
        tr: 'Lütfen',
        so: 'Fadlan'
      },
      thanks: {
        en: 'Thank you',
        ar: 'شكراً',
        fa: 'متشکرم',
        ur: 'شکریہ',
        ps: 'مننه',
        fr: 'Merci',
        de: 'Danke',
        es: 'Gracias',
        tr: 'Teşekkürler',
        so: 'Mahadsanid'
      },
      sorry: {
        en: 'Sorry',
        ar: 'آسف',
        fa: 'متأسفم',
        ur: 'معذرت',
        ps: 'بخښنه',
        fr: 'Désolé',
        de: 'Entschuldigung',
        es: 'Lo siento',
        tr: 'Özür dilerim',
        so: 'Waan ka xumahay'
      },
      name: {
        en: 'My name is...',
        ar: 'اسمي...',
        fa: 'نام من ... است',
        ur: 'میرا نام ... ہے',
        ps: 'زما نوم ... دی',
        fr: 'Je m\'appelle...',
        de: 'Ich heiße...',
        es: 'Mi nombre es...',
        tr: 'Benim adım...',
        so: 'Magacaygu waa...'
      },
      from: {
        en: 'I am from...',
        ar: 'أنا من...',
        fa: 'من از ... هستم',
        ur: 'میں ... سے ہوں',
        ps: 'زه د ... څخه یم',
        fr: 'Je viens de...',
        de: 'Ich komme aus...',
        es: 'Soy de...',
        tr: '...lıyım',
        so: 'Waxaan ka imid...'
      },
      age: {
        en: 'I am ... years old',
        ar: 'عمري ... سنة',
        fa: 'من ... سال دارم',
        ur: 'میری عمر ... سال ہے',
        ps: 'زه ... کلن یم',
        fr: "J'ai ... ans",
        de: 'Ich bin ... Jahre alt',
        es: 'Tengo ... años',
        tr: '... yaşındayım',
        so: 'Waxaan jiraa ... sano'
      }
    };
    
    // Categories for organization
    this.categories = {
      emergency: ['help', 'emergency', 'danger', 'fire', 'police', 'afraid', 'threat', 'safe'],
      medical: ['doctor', 'hospital', 'hurt', 'pain', 'medicine', 'pregnant', 'allergic'],
      legal: ['asylum', 'refugee', 'lawyer', 'rights', 'embassy', 'passport', 'documents', 'identity'],
      basic: ['water', 'food', 'hungry', 'thirsty', 'bathroom', 'shelter', 'cold', 'blanket', 'money', 'work'],
      family: ['family', 'children', 'lost', 'separated', 'from', 'age', 'name'],
      communication: ['understand', 'speak', 'translator', 'phone', 'yes', 'no', 'please', 'thanks', 'sorry', 'where', 'here', 'there']
    };
  }

  getPhrases(category, language) {
    const phrasesInCategory = this.categories[category] || [];
    const result = [];
    
    phrasesInCategory.forEach(phraseKey => {
      if (this.phrases[phraseKey]) {
        const phrase = this.phrases[phraseKey];
        result.push({
          key: phraseKey,
          text: phrase[language] || phrase.en,
          original: phrase.en,
          phonetic: this.getPhonetic(phraseKey, language)
        });
      }
    });
    
    return result;
  }

  getAllPhrases(language) {
    const result = [];
    
    Object.keys(this.phrases).forEach(phraseKey => {
      const phrase = this.phrases[phraseKey];
      result.push({
        key: phraseKey,
        text: phrase[language] || phrase.en,
        original: phrase.en,
        phonetic: this.getPhonetic(phraseKey, language)
      });
    });
    
    return result;
  }

  searchPhrases(query, language) {
    const normalizedQuery = query.toLowerCase();
    const results = [];
    
    Object.keys(this.phrases).forEach(phraseKey => {
      const phrase = this.phrases[phraseKey];
      const text = phrase[language] || phrase.en;
      const original = phrase.en;
      
      if (text.toLowerCase().includes(normalizedQuery) || 
          original.toLowerCase().includes(normalizedQuery) ||
          phraseKey.includes(normalizedQuery)) {
        results.push({
          key: phraseKey,
          text: text,
          original: original,
          phonetic: this.getPhonetic(phraseKey, language)
        });
      }
    });
    
    return results;
  }

  getPhonetic(phraseKey, language) {
    // Simplified phonetic representations for critical phrases
    // In a full implementation, this would have comprehensive phonetics
    const phoneticGuides = {
      help: {
        ar: 'musa-ada',
        fa: 'komak',
        ur: 'madad',
        ps: 'marasta'
      },
      doctor: {
        ar: 'tabeeb',
        fa: 'doktor',
        ur: 'daktar',
        ps: 'daktar'
      },
      water: {
        ar: 'maa',
        fa: 'aab',
        ur: 'paani',
        ps: 'oba'
      }
    };
    
    return phoneticGuides[phraseKey]?.[language] || null;
  }

  getCategories() {
    return Object.keys(this.categories);
  }

  getLanguages() {
    return ['en', 'ar', 'fa', 'ur', 'ps', 'fr', 'de', 'es', 'tr', 'so'];
  }

  getLanguageName(code) {
    const names = {
      en: 'English',
      ar: 'العربية (Arabic)',
      fa: 'فارسی (Persian)',
      ur: 'اردو (Urdu)',
      ps: 'پښتو (Pashto)',
      fr: 'Français (French)',
      de: 'Deutsch (German)',
      es: 'Español (Spanish)',
      tr: 'Türkçe (Turkish)',
      so: 'Soomaali (Somali)'
    };
    return names[code] || code;
  }
}

// Create singleton instance
window.EmergencyPhrases = EmergencyPhrases;
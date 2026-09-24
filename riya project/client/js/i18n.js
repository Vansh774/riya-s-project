/**
 * FreshField Multi-Language Translation System (i18n)
 * Supports English, Hindi (हिन्दी), and Gujarati (ગુજરાતી)
 * Works across all pages and sections with persistence.
 */

const i18n = {
    currentLang: localStorage.getItem('freshfield_lang') || 'en',

    languages: {
        en: { name: 'English', flag: '🇬🇧', label: 'English' },
        hi: { name: 'हिन्दी', flag: '🇮🇳', label: 'हिन्दी (Hindi)' },
        gu: { name: 'ગુજરાતી', flag: '🇮🇳', label: 'ગુજરાતી (Gujarati)' }
    },

    // Comprehensive Dictionary for core UI elements, buttons, and sections
    dictionary: {
        en: {
            // Navigation & Header
            "nav_home": "Home",
            "nav_produce": "Produce",
            "nav_how_it_works": "How It Works",
            "nav_about": "About",
            "nav_sustainability": "Sustainability",
            "nav_cart": "Cart",
            "nav_basket": "Your Basket",
            "nav_login": "Sign In",
            "nav_register": "Register",
            "nav_logout": "Sign Out",
            "nav_dashboard": "Dashboard",
            "nav_farmer_dashboard": "Farmer Dashboard",
            "nav_customer_dashboard": "Customer Portal",
            "nav_admin_dashboard": "Admin Panel",
            "nav_my_orders": "My Orders",
            "nav_wishlist": "Wishlist",
            "nav_profile": "Profile",
            "nav_reports": "Report a Farmer",
            
            // Landing Page Hero & Sections
            "hero_tag": "Direct Farm-to-Fork Marketplace",
            "hero_title": "Fresh, Organic Harvest Straight from Local Fields",
            "hero_subtitle": "Support local growers. Taste the vibrant freshness of fruits, crisp vegetables, and artisanal farm goods delivered right to your doorstep within hours of harvest.",
            "hero_cta_shop": "Explore Produce",
            "hero_cta_farmer": "Join as Farmer",
            "stat_farmers": "Active Farms",
            "stat_products": "Fresh Harvests",
            "stat_customers": "Happy Families",
            "stat_delivery": "Avg. Harvest-to-Door",
            "section_featured_title": "Today's Fresh Harvest",
            "section_featured_sub": "Hand-picked this morning by certified local growers",
            "section_how_title": "How FreshField Works",
            "section_how_sub": "Transparent, direct connection between farmers and consumers",
            
            // Common Actions & Buttons
            "btn_add_to_cart": "Add to Basket",
            "btn_added": "Added",
            "btn_buy_now": "Buy Now",
            "btn_view_farm": "View Farm",
            "btn_view_details": "View Produce",
            "btn_proceed_checkout": "Proceed to Checkout",
            "btn_place_order": "Place Order",
            "btn_search": "Search",
            "btn_filter": "Filter",
            "btn_clear": "Clear",
            "btn_close": "Close",
            "btn_save": "Save Changes",
            "btn_cancel": "Cancel",
            "btn_confirm": "Confirm",
            "btn_submit": "Submit",
            "btn_explore_farm": "Browse All Produce from this Farm",
            
            // Cart & Minimum Order
            "cart_title": "Your Basket 🛒",
            "cart_empty_title": "Your cart is empty",
            "cart_empty_sub": "Start adding fresh produce from local farms!",
            "cart_subtotal": "Subtotal",
            "cart_delivery_free": "FREE",
            "cart_total": "Total",
            "cart_min_warning": "Cart must having 600 INR to buy",
            "cart_min_notice": "Minimum Order: ₹600",
            "cart_min_add_more": "Add more produce to reach the ₹600 threshold to buy.",
            "cart_min_reached": "Minimum order reached! Ready to buy.",
            
            // Product Detail Page
            "prod_in_stock": "In Stock",
            "prod_out_of_stock": "Out of Stock",
            "prod_farmer_title": "Harvested By",
            "prod_verified_kisan": "Verified Kisan",
            "prod_verified_farm": "Verified Farm",
            "prod_delivery_info": "Delivery Information",
            "prod_same_day": "Same-Day Cold Chain Delivery",
            "prod_fresh_guarantee": "100% Freshness Guarantee",
            "prod_specs": "Produce Specifications",
            "prod_related": "More Fresh Harvests You Might Like",
            "prod_reviews": "Customer Reviews",
            
            // Farm Modal
            "farm_modal_title": "Farm & Grower Profile",
            "farm_modal_sub": "Learn about the farm and agricultural practices behind your food",
            "farm_contact": "Farmer Contact",
            "farm_location": "Farm Location",
            "farm_crops": "Available Produce from this Farm",
            "farm_orders_fulfilled": "Orders Delivered",
            "farm_badge_verified": "✓ Verified Kisan Farmer",
            
            // Customer & Farmer Dashboards
            "cust_welcome": "Welcome back",
            "cust_browse_heading": "Fresh from Local Farms",
            "cust_search_placeholder": "Search fresh fruits, vegetables, leafy greens...",
            "cust_all_categories": "All Categories",
            "cust_filter_all": "All Farms",
            "order_status_pending": "Order Placed",
            "order_status_confirmed": "Order Confirmed",
            "order_status_preparing": "Freshly Harvesting & Packing",
            "order_status_ready": "Ready for Dispatch",
            "order_status_out_for_delivery": "Out for Delivery",
            "order_status_delivered": "Delivered Fresh",
            
            // Footer
            "footer_tagline": "Empowering growers. Nourishing communities.",
            "footer_rights": "All rights reserved. FreshField Marketplace."
        },

        hi: {
            // Navigation & Header
            "nav_home": "होम",
            "nav_produce": "ताज़ा फसल",
            "nav_how_it_works": "यह कैसे काम करता है",
            "nav_about": "हमारे बारे में",
            "nav_sustainability": "स्थिरता",
            "nav_cart": "टोकरी",
            "nav_basket": "आपकी टोकरी",
            "nav_login": "लॉग इन",
            "nav_register": "रजिस्टर करें",
            "nav_logout": "लॉग आउट",
            "nav_dashboard": "डैशबोर्ड",
            "nav_farmer_dashboard": "किसान डैशबोर्ड",
            "nav_customer_dashboard": "ग्राहक पोर्टल",
            "nav_admin_dashboard": "एडमिन पैनल",
            "nav_my_orders": "मेरे ऑर्डर",
            "nav_wishlist": "पसंदीदा सूची",
            "nav_profile": "प्रोफ़ाइल",
            "nav_reports": "किसान की शिकायत दर्ज करें",
            
            // Landing Page Hero & Sections
            "hero_tag": "खेत से सीधे आपकी थाली तक",
            "hero_title": "स्थानीय खेतों से सीधे ताज़ा, जैविक फसल",
            "hero_subtitle": "स्थानीय किसानों का समर्थन करें। ताज़ा फलों, कुरकुरी सब्जियों और जैविक उत्पादों का स्वाद लें, जो कटाई के कुछ ही घंटों में आपके घर तक पहुँचाए जाते हैं।",
            "hero_cta_shop": "फसलें देखें",
            "hero_cta_farmer": "किसान के रूप में जुड़ें",
            "stat_farmers": "सक्रिय खेत",
            "stat_products": "ताज़ा फसलें",
            "stat_customers": "खुशहाल परिवार",
            "stat_delivery": "कटाई से घर तक",
            "section_featured_title": "आज की ताज़ा उपज",
            "section_featured_sub": "प्रमाणित स्थानीय किसानों द्वारा आज सुबह हाथ से चुनी गई",
            "section_how_title": "फ्रेशफील्ड कैसे काम करता है",
            "section_how_sub": "किसानों और उपभोक्ताओं के बीच सीधा और पारदर्शी संबंध",
            
            // Common Actions & Buttons
            "btn_add_to_cart": "टोकरी में जोड़ें",
            "btn_added": "जोड़ा गया",
            "btn_buy_now": "अभी खरीदें",
            "btn_view_farm": "खेत देखें",
            "btn_view_details": "उपज देखें",
            "btn_proceed_checkout": "चेकआउट करें",
            "btn_place_order": "ऑर्डर दें",
            "btn_search": "खोजें",
            "btn_filter": "फ़िल्टर",
            "btn_clear": "साफ़ करें",
            "btn_close": "बंद करें",
            "btn_save": "बदलाव सहेजें",
            "btn_cancel": "रद्द करें",
            "btn_confirm": "पुष्टि करें",
            "btn_submit": "जमा करें",
            "btn_explore_farm": "इस खेत की सभी फसलें देखें",
            
            // Cart & Minimum Order
            "cart_title": "आपकी टोकरी 🛒",
            "cart_empty_title": "आपकी टोकरी खाली है",
            "cart_empty_sub": "स्थानीय खेतों से ताज़ा उपज जोड़ना शुरू करें!",
            "cart_subtotal": "उप-योग",
            "cart_delivery_free": "मुफ़्त",
            "cart_total": "कुल योग",
            "cart_min_warning": "खरीदने के लिए टोकरी में कम से कम 600 रुपये होने चाहिए",
            "cart_min_notice": "न्यूनतम ऑर्डर: ₹600",
            "cart_min_add_more": "खरीदने के लिए ₹600 का न्यूनतम लक्ष्य पूरा करने हेतु और फसलें जोड़ें।",
            "cart_min_reached": "न्यूनतम ऑर्डर राशि पूरी हुई! खरीदने के लिए तैयार।",
            
            // Product Detail Page
            "prod_in_stock": "उपलब्ध है",
            "prod_out_of_stock": "उपलब्ध नहीं है",
            "prod_farmer_title": "उत्पादक किसान",
            "prod_verified_kisan": "सत्यापित किसान",
            "prod_verified_farm": "प्रमाणित खेत",
            "prod_delivery_info": "डिलीवरी की जानकारी",
            "prod_same_day": "उसी दिन कोल्ड-चेन डिलीवरी",
            "prod_fresh_guarantee": "100% ताज़गी की गारंटी",
            "prod_specs": "उत्पाद विवरण",
            "prod_related": "अन्य ताज़ा उपज जो आपको पसंद आ सकती हैं",
            "prod_reviews": "ग्राहक समीक्षाएँ",
            
            // Farm Modal
            "farm_modal_title": "खेत एवं किसान प्रोफ़ाइल",
            "farm_modal_sub": "जानिए उस खेत और जैविक तौर-तरीकों के बारे में जहाँ से आपका भोजन आता है",
            "farm_contact": "किसान से संपर्क",
            "farm_location": "खेत का स्थान",
            "farm_crops": "इस खेत की उपलब्ध फसलें",
            "farm_orders_fulfilled": "सफलतापूर्वक पहुँचाए गए ऑर्डर",
            "farm_badge_verified": "✓ सत्यापित किसान कार्ड धारक",
            
            // Customer & Farmer Dashboards
            "cust_welcome": "वापसी पर स्वागत है",
            "cust_browse_heading": "स्थानीय खेतों से ताज़ा उपज",
            "cust_search_placeholder": "ताज़ा फल, सब्ज़ियाँ, पत्तेदार सब्ज़ियाँ खोजें...",
            "cust_all_categories": "सभी श्रेणियाँ",
            "cust_filter_all": "सभी खेत",
            "order_status_pending": "ऑर्डर प्राप्त हुआ",
            "order_status_confirmed": "ऑर्डर की पुष्टि हुई",
            "order_status_preparing": "ताज़ा कटाई और पैकिंग जारी है",
            "order_status_ready": "डिस्पैच के लिए तैयार",
            "order_status_out_for_delivery": "डिलीवरी के लिए निकल चुका है",
            "order_status_delivered": "सफलतापूर्वक पहुँचाया गया",
            
            // Footer
            "footer_tagline": "किसानों को सशक्त बनाना। परिवारों का पोषण करना।",
            "footer_rights": "सर्वाधिकार सुरक्षित। फ्रेशफील्ड मार्केटप्लेस।"
        },

        gu: {
            // Navigation & Header
            "nav_home": "હોમ",
            "nav_produce": "તાજી પેદાશ",
            "nav_how_it_works": "તે કેવી રીતે કાર્ય કરે છે",
            "nav_about": "અમારા વિશે",
            "nav_sustainability": "ટકાઉપણું",
            "nav_cart": "ટોપલી",
            "nav_basket": "તમારી ટોપલી",
            "nav_login": "સાઇન ઇન",
            "nav_register": "નોંધણી કરો",
            "nav_logout": "સાઇન આઉટ",
            "nav_dashboard": "ડેશબોર્ડ",
            "nav_farmer_dashboard": "ખેડૂત ડેશબોર્ડ",
            "nav_customer_dashboard": "ગ્રાહક પોર્ટલ",
            "nav_admin_dashboard": "એડમિન પેનલ",
            "nav_my_orders": "મારા ઓર્ડર",
            "nav_wishlist": "પસંદગી યાદી",
            "nav_profile": "પ્રોફાઇલ",
            "nav_reports": "ખેડૂતની ફરિયાદ કરો",
            
            // Landing Page Hero & Sections
            "hero_tag": "ખેતરથી સીધા તમારી થાળી સુધી",
            "hero_title": "સ્થાનિક ખેતરોમાંથી સીધા તાજા અને ઓર્ગેનિક પાક",
            "hero_subtitle": "સ્થાનિક ખેડૂતોને સહયોગ આપો. લણણીના થોડા જ કલાકોમાં તમારા ઘર સુધી પહોંચાડવામાં આવતા તાજા ફળો, શાકભાજી અને ખેતરના ઉત્પાદનોનો સ્વાદ માણો.",
            "hero_cta_shop": "પાક જુઓ",
            "hero_cta_farmer": "ખેડૂત તરીકે જોડાઓ",
            "stat_farmers": "સક્રિય ખેતરો",
            "stat_products": "તાજા પાક",
            "stat_customers": "સંતુષ્ટ પરિવારો",
            "stat_delivery": "ખેતરથી સીધા ઘરે",
            "section_featured_title": "આજનો તાજો પાક",
            "section_featured_sub": "પ્રમાણિત સ્થાનિક ખેડૂતો દ્વારા આજે સવારે જ પસંદ કરાયેલ",
            "section_how_title": "ફ્રેશફીલ્ડ કેવી રીતે કામ કરે છે",
            "section_how_sub": "ખેડૂતો અને ગ્રાહકો વચ્ચે સીધો અને પારદર્શક જોડાણ",
            
            // Common Actions & Buttons
            "btn_add_to_cart": "ટોપલીમાં ઉમેરો",
            "btn_added": "ઉમેરાઈ ગયું",
            "btn_buy_now": "હમણાં ખરીદો",
            "btn_view_farm": "ખેતર જુઓ",
            "btn_view_details": "વિગત જુઓ",
            "btn_proceed_checkout": "ચેકઆઉટ કરો",
            "btn_place_order": "ઓર્ડર આપો",
            "btn_search": "શોધો",
            "btn_filter": "ફિલ્ટર",
            "btn_clear": "સાફ કરો",
            "btn_close": "બંધ કરો",
            "btn_save": "સાચવો",
            "btn_cancel": "રદ કરો",
            "btn_confirm": "પુષ્ટિ કરો",
            "btn_submit": "સબમિટ કરો",
            "btn_explore_farm": "આ ખેતરના તમામ પાક જુઓ",
            
            // Cart & Minimum Order
            "cart_title": "તમારી ટોપલી 🛒",
            "cart_empty_title": "તમારી ટોપલી ખાલી છે",
            "cart_empty_sub": "સ્થાનિક ખેતરોમાંથી તાજા શાકભાજી અને ફળો ઉમેરવાનું શરૂ કરો!",
            "cart_subtotal": "કુલ રકમ",
            "cart_delivery_free": "મફત",
            "cart_total": "ચૂકવવાપાત્ર કુલ",
            "cart_min_warning": "ઓર્ડર ખરીદવા માટે ટોપલીમાં ઓછામાં ઓછા 600 રૂપિયા હોવા જરૂરી છે",
            "cart_min_notice": "ન્યૂનતમ ઓર્ડર: ₹600",
            "cart_min_add_more": "ખરીદવા માટે ₹600 ની મર્યાદા પૂરી કરવા વધુ પાક ઉમેરો.",
            "cart_min_reached": "ન્યૂનતમ ઓર્ડર રકમ પહોંચી ગઈ! ખરીદવા માટે તૈયાર.",
            
            // Product Detail Page
            "prod_in_stock": "સ્ટોકમાં ઉપલબ્ધ",
            "prod_out_of_stock": "સ્ટોક ખલાસ",
            "prod_farmer_title": "ઉત્પાદક ખેડૂત",
            "prod_verified_kisan": "પ્રમાણિત કિસાન",
            "prod_verified_farm": "પ્રમાણિત ખેતર",
            "prod_delivery_info": "ડિલિવરી માહિતી",
            "prod_same_day": "તે જ દિવસે કોલ્ડ-ચેઈન ડિલિવરી",
            "prod_fresh_guarantee": "૧૦૦% તાજગીની ખાતરી",
            "prod_specs": "પાકની વિગતો",
            "prod_related": "અન્ય તાજા ઉત્પાદનો જે તમને ગમશે",
            "prod_reviews": "ગ્રાહકોના પ્રતિભાવો",
            
            // Farm Modal
            "farm_modal_title": "ખેતર અને ખેડૂત પ્રોફાઇલ",
            "farm_modal_sub": "જાણો તમારા ખોરાક પાછળના ખેતર અને પરંપરાગત ખેતી પદ્ધતિઓ વિશે",
            "farm_contact": "ખેડૂતનો સંપર્ક",
            "farm_location": "ખેતરનું સ્થળ",
            "farm_crops": "આ ખેતરમાં ઉપલબ્ધ તાજા પાક",
            "farm_orders_fulfilled": "સફળતાપૂર્વક ડિલિવર થયેલા ઓર્ડર",
            "farm_badge_verified": "✓ પ્રમાણિત કિસાન કાર્ડ ધારક",
            
            // Customer & Farmer Dashboards
            "cust_welcome": "સ્વાગત છે",
            "cust_browse_heading": "સ્થાનિક ખેતરોમાંથી તાજી લણણી",
            "cust_search_placeholder": "તાજા ફળો, શાકભાજી અને ભાજીઓ શોધો...",
            "cust_all_categories": "તમામ કેટેગરી",
            "cust_filter_all": "બધા ખેતરો",
            "order_status_pending": "ઓર્ડર સ્વીકારાયો",
            "order_status_confirmed": "ઓર્ડર કન્ફર્મ થયો",
            "order_status_preparing": "તાજી લણણી અને પેકિંગ ચાલુ છે",
            "order_status_ready": "મોકલવા માટે તૈયાર",
            "order_status_out_for_delivery": "ડિલિવરી માટે નીકળેલ છે",
            "order_status_delivered": "સફળતાપૂર્વક પહોંચાડાયું",
            
            // Footer
            "footer_tagline": "ખેડૂતોને સશક્ત બનાવવું. સમુદાયને પૌષ્ટિક આહાર આપવો.",
            "footer_rights": "સર્વાધિકાર સુરક્ષિત. ફ્રેશફીલ્ડ માર્કેટપ્લેસ."
        }
    },

    // Get translated phrase
    t(key) {
        const lang = this.currentLang;
        if (this.dictionary[lang] && this.dictionary[lang][key]) {
            return this.dictionary[lang][key];
        }
        return (this.dictionary.en && this.dictionary.en[key]) || key;
    },

    // Set active language and re-translate everything
    setLanguage(lang) {
        if (!['en', 'hi', 'gu'].includes(lang)) lang = 'en';
        this.currentLang = lang;
        localStorage.setItem('freshfield_lang', lang);

        // Update all dropdowns on current page
        document.querySelectorAll('.freshfield-lang-select').forEach(sel => {
            sel.value = lang;
        });

        // Set Google Translate cookie so Google Translate engine mirrors this language
        this.setGoogleTranslateCookie(lang);

        // Translate all marked elements and standard vocabulary
        this.applyTranslations();

        // Dispatch language change event for custom component listeners
        window.dispatchEvent(new CustomEvent('freshfieldLanguageChanged', { detail: { lang } }));
    },

    setGoogleTranslateCookie(lang) {
        const val = lang === 'en' ? '' : `/en/${lang}`;
        document.cookie = `googtrans=${val}; path=/; domain=${location.hostname}`;
        document.cookie = `googtrans=${val}; path=/;`;
        
        // Trigger Google Translate frame if loaded
        try {
            const selectEl = document.querySelector('.goog-te-combo');
            if (selectEl) {
                selectEl.value = lang;
                selectEl.dispatchEvent(new Event('change'));
            }
        } catch (e) {}
    },

    // Apply dictionary translations to DOM elements
    applyTranslations() {
        const lang = this.currentLang;
        const dict = this.dictionary[lang] || this.dictionary.en;

        // 1. Elements with explicit data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = dict[key];
                } else {
                    el.textContent = dict[key];
                }
            }
        });

        // 2. Elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) {
                el.placeholder = dict[key];
            }
        });

        // 3. Translate common text patterns across buttons, links and labels
        this.translateCommonButtonsAndHeadings(dict);
    },

    translateCommonButtonsAndHeadings(dict) {
        // Translate buttons containing known English text
        const map = [
            { en: 'Add to Basket', key: 'btn_add_to_cart' },
            { en: 'Add to Cart', key: 'btn_add_to_cart' },
            { en: 'Buy Now', key: 'btn_buy_now' },
            { en: 'View Farm', key: 'btn_view_farm' },
            { en: 'Proceed to Checkout', key: 'btn_proceed_checkout' },
            { en: 'Place Order', key: 'btn_place_order' },
            { en: 'Your Basket', key: 'cart_title' },
            { en: 'Subtotal', key: 'cart_subtotal' },
            { en: 'Total', key: 'cart_total' },
            { en: 'In Stock', key: 'prod_in_stock' },
            { en: 'Out of Stock', key: 'prod_out_of_stock' },
            { en: 'Verified Kisan', key: 'prod_verified_kisan' },
            { en: 'Verified Farm', key: 'prod_verified_farm' },
            { en: 'Delivery Information', key: 'prod_delivery_info' },
            { en: 'Produce Specifications', key: 'prod_specs' }
        ];

        document.querySelectorAll('button, a, span, h1, h2, h3, h4, label').forEach(el => {
            // Avoid modifying dropdowns or icons
            if (el.closest('.freshfield-lang-dropdown') || el.closest('.freshfield-floating-lang-pill') || el.classList.contains('fa') || el.classList.contains('fas')) return;

            const text = el.textContent.trim();
            for (const item of map) {
                if (text === item.en && dict[item.key]) {
                    el.textContent = dict[item.key];
                    break;
                }
            }
        });
    },

    // Render language dropdown markup
    createLanguageDropdownHTML() {
        return `
            <div class="freshfield-lang-dropdown" title="Change Language / भाषा बदलें / ભાષા બદલો">
                <i class="fas fa-globe" style="color:#15803D; font-size:13px;"></i>
                <select class="freshfield-lang-select" onchange="i18n.setLanguage(this.value)" aria-label="Select Language">
                    <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                    <option value="hi" ${this.currentLang === 'hi' ? 'selected' : ''}>🇮🇳 हिन्दी</option>
                    <option value="gu" ${this.currentLang === 'gu' ? 'selected' : ''}>🇮🇳 ગુજરાતી</option>
                </select>
            </div>
        `;
    },

    // Inject floating language pill at the bottom corner of every page
    injectFloatingPill() {
        if (document.getElementById('freshfield-floating-lang')) return;

        const pill = document.createElement('div');
        pill.id = 'freshfield-floating-lang';
        pill.className = 'freshfield-floating-lang-pill';
        pill.innerHTML = `
            <i class="fas fa-language"></i>
            <select class="freshfield-lang-select" onchange="i18n.setLanguage(this.value)" aria-label="Quick Language Switcher">
                <option value="en" ${this.currentLang === 'en' ? 'selected' : ''}>English</option>
                <option value="hi" ${this.currentLang === 'hi' ? 'selected' : ''}>हिन्दी (Hindi)</option>
                <option value="gu" ${this.currentLang === 'gu' ? 'selected' : ''}>ગુજરાતી (Gujarati)</option>
            </select>
        `;
        document.body.appendChild(pill);
    },

    // Load Google Translate Widget in background for comprehensive whole-page translation
    initGoogleTranslate() {
        if (window.google && window.google.translate) return;

        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,gu',
                autoDisplay: false
            }, 'google_translate_element');
        };

        const gDiv = document.createElement('div');
        gDiv.id = 'google_translate_element';
        gDiv.style.display = 'none';
        document.body.appendChild(gDiv);

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.head.appendChild(script);
    },

    // Main initialization routine
    init() {
        // Read stored language
        this.currentLang = localStorage.getItem('freshfield_lang') || 'en';

        // Inject stylesheet if not loaded
        if (!document.querySelector('link[href*="i18n.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'css/i18n.css';
            document.head.appendChild(link);
        }

        // Inject floating switcher
        this.injectFloatingPill();

        // Inject into navigation headers automatically if a placeholder or nav container exists
        const navContainers = document.querySelectorAll('.nav-actions, .header-right-actions, .topbar-actions-right, .header-right, .topbar-right, .top-bar-right, .admin-topbar-right, .auth-top-navbar');
        navContainers.forEach(container => {
            if (!container.querySelector('.freshfield-lang-dropdown')) {
                const wrap = document.createElement('div');
                wrap.style.display = 'inline-flex';
                wrap.style.alignItems = 'center';
                wrap.style.marginRight = '8px';
                wrap.innerHTML = this.createLanguageDropdownHTML();
                container.prepend(wrap);
            }
        });

        // Sync all selects on the page with currentLang
        document.querySelectorAll('.freshfield-lang-select').forEach(sel => {
            sel.value = this.currentLang;
        });

        // Initialize Google Translate
        this.initGoogleTranslate();

        // Apply translations
        this.applyTranslations();

        // Re-apply whenever dynamically loaded content finishes
        setTimeout(() => this.applyTranslations(), 500);
        setTimeout(() => this.applyTranslations(), 1500);
    }
};

// Global export
window.i18n = i18n;

// Auto-run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}

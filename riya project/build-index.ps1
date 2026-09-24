<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreshField - Farm to Your Table | Local Produce Marketplace</title>
    <meta name="description" content="FreshField connects conscious consumers with local farmers. Discover fresh organic produce delivered directly from the source.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<style>
/* === FRESHFIELD DESIGN SYSTEM === */
:root {
    --cream: #F8F5EC; --cream-light: #FFFDF8; --beige: #EEE9DA; --beige-mid: #E5DEC8;
    --green-primary: #355C24; --green-secondary: #6F9638; --green-soft: #A8BF72; --green-pale: #D6E4B8;
    --orange: #F28C28; --orange-light: #FBBF75;
    --text-dark: #1F211B; --text-muted: #6F7168; --text-light: #9B9D95; --white: #FFFFFF;
    --font-serif: 'Playfair Display', Georgia, serif; --font-sans: 'Poppins', -apple-system, sans-serif;
    --section-pad: 100px 0; --container-max: 1240px; --container-pad: 0 40px;
    --shadow-sm: 0 2px 12px rgba(53,92,36,0.06); --shadow-md: 0 6px 30px rgba(53,92,36,0.10); --shadow-lg: 0 16px 60px rgba(53,92,36,0.14);
    --radius-sm: 8px; --radius-md: 16px; --radius-lg: 24px; --radius-pill: 100px;
    --ease-out: cubic-bezier(0.16,1,0.3,1); --ease-in-out: cubic-bezier(0.4,0,0.2,1);
    --t-fast: 0.2s; --t-med: 0.4s; --t-slow: 0.7s;
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;font-size:16px;}
body{font-family:var(--font-sans);background:var(--cream);color:var(--text-dark);line-height:1.6;overflow-x:hidden;}
a{text-decoration:none;color:inherit;}
img{max-width:100%;display:block;}
button{font-family:var(--font-sans);cursor:pointer;border:none;background:none;}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}
.container{max-width:var(--container-max);margin:0 auto;padding:var(--container-pad);}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;}}

/* REVEAL */
.reveal-up{opacity:0;transform:translateY(32px);transition:opacity 0.7s var(--ease-out),transform 0.7s var(--ease-out);}
.reveal-up.visible{opacity:1;transform:translateY(0);}
.delay-1{transition-delay:0.1s;} .delay-2{transition-delay:0.2s;} .delay-3{transition-delay:0.3s;}
.delay-4{transition-delay:0.4s;} .delay-5{transition-delay:0.5s;} .delay-6{transition-delay:0.6s;}

/* BUTTONS */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-sans);font-weight:600;font-size:14px;letter-spacing:0.02em;padding:14px 28px;border-radius:var(--radius-pill);transition:transform var(--t-fast) var(--ease-out),box-shadow var(--t-fast) var(--ease-out),background var(--t-fast) var(--ease-out),color var(--t-fast) var(--ease-out);cursor:pointer;border:none;text-decoration:none;position:relative;overflow:hidden;}
.btn-primary{background:var(--green-primary);color:var(--white);box-shadow:0 4px 18px rgba(53,92,36,0.28);}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(53,92,36,0.36);}
.btn-outline{background:transparent;color:var(--green-primary);border:1.5px solid var(--green-primary);}
.btn-outline:hover{background:var(--green-primary);color:var(--white);transform:translateY(-2px);}
.btn-ghost-link{background:transparent;color:var(--text-dark);display:inline-flex;align-items:center;gap:12px;padding:12px 0;font-weight:500;font-family:var(--font-sans);cursor:pointer;border:none;text-decoration:none;}
.play-circle{width:44px;height:44px;border-radius:50%;border:1.5px solid var(--beige-mid);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text-dark);transition:all var(--t-fast) var(--ease-out);flex-shrink:0;}
.btn-ghost-link:hover .play-circle{border-color:var(--green-primary);color:var(--green-primary);transform:scale(1.08);}
.ghost-text{text-align:left;} .ghost-text strong{display:block;font-size:14px;font-weight:600;} .ghost-text small{display:block;font-size:11px;color:var(--text-muted);font-weight:400;}
.btn-lg{padding:18px 38px;font-size:15px;} .btn-sm{padding:10px 20px;font-size:13px;}

/* NAV */
#site-nav{position:fixed;top:0;left:0;right:0;z-index:1000;padding:20px 0;transition:padding var(--t-med) var(--ease-out),background var(--t-med) var(--ease-out),box-shadow var(--t-med) var(--ease-out);}
#site-nav.scrolled{padding:12px 0;background:rgba(248,245,236,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:0 1px 0 rgba(53,92,36,0.08);}
.nav-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0;}
.nav-logo-icon{width:42px;height:42px;background:var(--green-primary);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.nav-logo-icon svg{width:24px;height:24px;}
.nav-logo-text{line-height:1.2;}
.nav-logo-name{font-family:var(--font-serif);font-size:20px;font-weight:700;color:var(--text-dark);display:block;}
.nav-logo-tagline{font-family:var(--font-sans);font-size:10px;font-weight:400;color:var(--text-muted);letter-spacing:0.06em;display:block;}
.nav-links{display:flex;align-items:center;gap:6px;list-style:none;}
.nav-links a{font-size:14px;font-weight:500;color:var(--text-dark);padding:8px 14px;border-radius:var(--radius-sm);transition:color var(--t-fast),background var(--t-fast);position:relative;display:block;}
.nav-links a::after{content:'';position:absolute;bottom:4px;left:14px;right:14px;height:1.5px;background:var(--green-secondary);transform:scaleX(0);transform-origin:left;transition:transform var(--t-med) var(--ease-out);}
.nav-links a:hover{color:var(--green-primary);}
.nav-links a:hover::after,.nav-links a.active::after{transform:scaleX(1);}
.nav-links a.active{color:var(--green-primary);font-weight:600;}
.nav-actions{display:flex;align-items:center;gap:12px;flex-shrink:0;}
.nav-cart-btn{width:40px;height:40px;border-radius:50%;border:1.5px solid var(--beige-mid);background:var(--cream-light);display:flex;align-items:center;justify-content:center;position:relative;cursor:pointer;transition:all var(--t-fast) var(--ease-out);color:var(--text-dark);font-size:15px;}
.nav-cart-btn:hover{border-color:var(--green-primary);color:var(--green-primary);transform:scale(1.06);}
.cart-badge{position:absolute;top:-4px;right:-4px;width:18px;height:18px;background:var(--orange);color:white;font-size:10px;font-weight:700;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-sans);transition:transform var(--t-fast) var(--ease-out);}
.cart-badge.bump{animation:cartBump 0.35s var(--ease-out);}
@keyframes cartBump{0%{transform:scale(1);}50%{transform:scale(1.4);}100%{transform:scale(1);}}
.hamburger{display:none;flex-direction:column;gap:5px;width:32px;cursor:pointer;padding:4px;}
.hamburger span{display:block;height:2px;background:var(--text-dark);border-radius:2px;transition:all var(--t-med) var(--ease-out);}
.hamburger span:first-child{width:100%;}.hamburger span:nth-child(2){width:70%;}.hamburger span:last-child{width:100%;}
.hamburger.active span:first-child{transform:rotate(45deg) translate(5px,5px);width:100%;}
.hamburger.active span:nth-child(2){opacity:0;transform:scaleX(0);}
.hamburger.active span:last-child{transform:rotate(-45deg) translate(5px,-5px);width:100%;}

/* HERO */
#hero{min-height:100vh;padding:140px 0 100px;position:relative;overflow:hidden;background:var(--cream);}
.hero-inner{display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:60px;position:relative;z-index:2;}
.hero-left{padding-top:20px;}
.hero-eyebrow{margin-bottom:28px;}
.eyebrow{font-family:var(--font-sans);font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--green-secondary);}
.eyebrow-wrap{display:inline-flex;align-items:center;gap:8px;}
.leaf-icon{width:14px;height:14px;display:inline-block;}
.hero-heading{font-family:var(--font-serif);font-size:clamp(48px,6vw,80px);font-weight:800;line-height:1.08;letter-spacing:-0.03em;color:var(--text-dark);margin-bottom:24px;}
.hero-heading .accent{color:var(--green-primary);font-style:italic;}
.hero-desc{font-size:17px;font-weight:400;color:var(--text-muted);line-height:1.7;max-width:400px;margin-bottom:14px;}
.hero-squiggle{display:block;margin-bottom:36px;}
.hero-ctas{display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:56px;}
.scroll-indicator{display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--text-muted);width:fit-content;}
.scroll-text{font-size:9px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;text-align:center;}
.scroll-mouse{width:22px;height:34px;border:1.5px solid var(--beige-mid);border-radius:11px;position:relative;display:flex;justify-content:center;padding-top:6px;}
.scroll-mouse-dot{width:4px;height:4px;background:var(--green-secondary);border-radius:50%;animation:scrollDot 2s ease-in-out infinite;}
@keyframes scrollDot{0%{transform:translateY(0);opacity:1;}80%{transform:translateY(10px);opacity:0;}100%{transform:translateY(0);opacity:0;}}
.scroll-dot{width:4px;height:4px;border-radius:50%;background:var(--orange);}
.hero-right{position:relative;display:flex;justify-content:center;align-items:center;}
.hero-image-wrap{position:relative;width:100%;max-width:580px;}
.hero-blob-bg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:95%;height:95%;background:var(--beige);border-radius:65% 35% 60% 40% / 50% 55% 45% 50%;z-index:1;animation:blobFloat 8s ease-in-out infinite;}
@keyframes blobFloat{0%,100%{border-radius:65% 35% 60% 40%/50% 55% 45% 50%;}33%{border-radius:55% 45% 50% 50%/60% 40% 65% 35%;}66%{border-radius:45% 55% 40% 60%/40% 60% 50% 50%;}}
.hero-image-blob{position:relative;z-index:2;}
.hero-image-blob img{width:100%;border-radius:60% 40% 70% 30%/55% 45% 55% 45%;box-shadow:var(--shadow-lg);transform:scale(0.96);filter:blur(8px);opacity:0;transition:opacity 1s var(--ease-out) 0.9s,transform 1s var(--ease-out) 0.9s,filter 1s var(--ease-out) 0.9s;aspect-ratio:1/1;object-fit:cover;}
.hero-image-blob img.img-loaded{opacity:1;transform:scale(1);filter:blur(0px);}
.natural-badge{position:absolute;bottom:5%;right:-5%;width:100px;height:100px;background:var(--green-soft);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:3;box-shadow:var(--shadow-md);animation:badgeFloat 4s ease-in-out infinite;}
@keyframes badgeFloat{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
.natural-badge-pct{font-family:var(--font-serif);font-size:22px;font-weight:700;color:var(--green-primary);line-height:1;}
.natural-badge-text{font-size:10px;font-weight:600;color:var(--green-primary);letter-spacing:0.05em;text-align:center;line-height:1.3;}
.botanical-decor{position:absolute;pointer-events:none;z-index:1;opacity:0;transition:opacity 1s var(--ease-out);}
.botanical-decor.visible{opacity:0.5;}
.botanical-tl{top:60px;left:-20px;}
.botanical-tr{top:10px;right:0;}
.hero-farm{position:absolute;bottom:0;left:0;right:0;height:160px;pointer-events:none;z-index:1;overflow:hidden;}
.hero-farm img{width:100%;height:100%;object-fit:cover;object-position:top;opacity:0.5;mask-image:linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 100%);-webkit-mask-image:linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 100%);}

/* STATISTICS */
#statistics{padding:var(--section-pad);background:var(--cream);}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-top:1px solid var(--beige-mid);border-bottom:1px solid var(--beige-mid);}
.stat-item{padding:56px 32px;text-align:center;position:relative;}
.stat-item:not(:last-child)::after{content:'';position:absolute;right:0;top:25%;bottom:25%;width:1px;background:var(--beige-mid);}
.stat-icon{width:52px;height:52px;border-radius:50%;border:1.5px solid var(--beige-mid);display:flex;align-items:center;justify-content:center;color:var(--green-primary);font-size:18px;margin:0 auto 20px;}
.stat-number{font-family:var(--font-serif);font-size:52px;font-weight:800;color:var(--green-primary);line-height:1;margin-bottom:8px;}
.stat-suffix{font-family:var(--font-serif);font-size:32px;color:var(--orange);}
.stat-label{font-size:13px;color:var(--text-muted);font-weight:500;}
.stat-underline{width:32px;height:2px;background:var(--orange);border-radius:2px;margin:12px auto 0;}

/* TRUST RIBBON */
#trust-ribbon{background:var(--cream-light);border-top:1px solid var(--beige-mid);border-bottom:1px solid var(--beige-mid);padding:20px 0;}
.trust-ribbon-inner{display:flex;align-items:center;justify-content:center;}
.trust-item{display:flex;align-items:center;gap:10px;padding:8px 32px;}
.trust-item:not(:last-child){border-right:1px solid var(--beige-mid);}
.trust-icon{width:36px;height:36px;background:var(--beige);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--green-primary);font-size:14px;flex-shrink:0;}
.trust-label{font-size:13px;font-weight:600;color:var(--text-dark);}

/* INTRO */
#intro{padding:var(--section-pad);}
.intro-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.intro-label{display:inline-block;background:var(--green-pale);color:var(--green-primary);font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;padding:6px 14px;border-radius:var(--radius-pill);margin-bottom:20px;}
.intro-heading{font-family:var(--font-serif);font-size:clamp(36px,4vw,54px);font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:var(--text-dark);margin-bottom:24px;}
.intro-body{font-size:16px;color:var(--text-muted);line-height:1.8;margin-bottom:36px;max-width:440px;}
.intro-organic-line{width:60px;height:3px;background:var(--orange);border-radius:2px;margin-top:32px;}
.intro-image-wrap{position:relative;}
.intro-image-wrap img{width:100%;border-radius:40% 60% 45% 55%/50% 45% 55% 50%;aspect-ratio:4/3;object-fit:cover;box-shadow:var(--shadow-lg);}
.intro-stat-chip{position:absolute;bottom:-20px;left:-20px;background:var(--white);border-radius:var(--radius-md);padding:16px 20px;box-shadow:var(--shadow-md);display:flex;align-items:center;gap:12px;}
.intro-stat-chip-number{font-family:var(--font-serif);font-size:28px;font-weight:700;color:var(--green-primary);line-height:1;}
.intro-stat-chip-label{font-size:12px;color:var(--text-muted);font-weight:500;}

/* FEATURED PRODUCE */
#featured-produce{padding:var(--section-pad);background:var(--cream-light);}
.section-header{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:56px;gap:20px;}
.section-heading{font-family:var(--font-serif);font-size:clamp(30px,4vw,46px);font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:var(--text-dark);}
.section-heading-label{font-size:11px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--green-secondary);margin-bottom:10px;}
.skeleton{background:linear-gradient(90deg,var(--beige) 25%,var(--cream-light) 50%,var(--beige) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:var(--radius-sm);}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.produce-layout{display:grid;grid-template-columns:1.4fr 1fr 1fr;grid-template-rows:auto auto;gap:20px;}
.produce-layout .product-card:first-child{grid-row:1/3;}
.product-card{background:var(--white);border-radius:var(--radius-lg);overflow:hidden;transition:transform var(--t-med) var(--ease-out),box-shadow var(--t-med) var(--ease-out);cursor:pointer;}
.product-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg);}
.product-card-img{position:relative;overflow:hidden;background:var(--beige);}
.produce-layout .product-card:first-child .product-card-img{height:320px;}
.product-card:not(:first-child) .product-card-img{height:180px;}
.product-card-img img{width:100%;height:100%;object-fit:cover;transition:transform 0.6s var(--ease-out);}
.product-card:hover .product-card-img img{transform:scale(1.04);}
.product-card-badge{position:absolute;top:12px;left:12px;background:var(--green-primary);color:white;font-size:10px;font-weight:600;padding:4px 10px;border-radius:var(--radius-pill);letter-spacing:0.05em;text-transform:uppercase;}
.product-card-body{padding:16px 18px 18px;}
.product-card-farm{font-size:11px;color:var(--text-light);font-weight:500;margin-bottom:4px;display:flex;align-items:center;gap:4px;}
.product-card-name{font-family:var(--font-serif);font-size:18px;font-weight:600;color:var(--text-dark);margin-bottom:8px;}
.produce-layout .product-card:not(:first-child) .product-card-name{font-size:15px;}
.product-card-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;}
.product-card-price{font-size:20px;font-weight:700;color:var(--green-primary);}
.produce-layout .product-card:not(:first-child) .product-card-price{font-size:17px;}
.product-card-unit{font-size:12px;color:var(--text-light);font-weight:400;}
.product-add-btn{width:36px;height:36px;background:var(--green-primary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;transition:all var(--t-fast) var(--ease-out);border:none;cursor:pointer;flex-shrink:0;}
.product-add-btn:hover{background:var(--green-secondary);transform:scale(1.1);}
.product-skeleton{background:var(--white);border-radius:var(--radius-lg);overflow:hidden;}
.product-skeleton-img{height:200px;}
.product-skeleton-body{padding:16px 18px;}
.product-skeleton-line{height:12px;margin-bottom:10px;border-radius:6px;}
.product-skeleton-line.short{width:60%;}.product-skeleton-line.long{width:100%;}
.product-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--beige);color:var(--text-light);font-size:36px;}

/* HOW IT WORKS */
#how-it-works{padding:var(--section-pad);}
.how-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.how-steps{display:flex;flex-direction:column;gap:0;position:relative;}
.how-steps::before{content:'';position:absolute;left:24px;top:40px;bottom:40px;width:1px;background:linear-gradient(to bottom,var(--green-pale),var(--beige));}
.how-step{display:flex;gap:28px;align-items:flex-start;padding:28px 0;}
.how-step-number{width:48px;height:48px;border-radius:50%;background:var(--cream);border:2px solid var(--beige-mid);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--font-serif);font-size:18px;font-weight:700;color:var(--green-primary);position:relative;z-index:2;transition:all var(--t-med) var(--ease-out);}
.how-step:hover .how-step-number{background:var(--green-primary);color:white;border-color:var(--green-primary);}
.how-step-content{flex:1;padding-top:10px;}
.how-step-tag{font-size:10px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:var(--orange);margin-bottom:6px;}
.how-step-title{font-family:var(--font-serif);font-size:22px;font-weight:600;color:var(--text-dark);margin-bottom:8px;}
.how-step-desc{font-size:14px;color:var(--text-muted);line-height:1.7;}
.how-visual{position:relative;}
.how-visual img{width:100%;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);aspect-ratio:3/4;object-fit:cover;}
.how-visual-card{position:absolute;top:-20px;right:-20px;background:var(--white);border-radius:var(--radius-md);padding:16px 20px;box-shadow:var(--shadow-md);display:flex;align-items:center;gap:10px;}
.how-visual-card-icon{width:36px;height:36px;background:var(--green-pale);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--green-primary);}
.how-visual-card-text strong{display:block;font-size:15px;font-weight:700;color:var(--text-dark);}
.how-visual-card-text span{font-size:12px;color:var(--text-muted);}

/* FARMER STORY */
#farmer-story{padding:var(--section-pad);background:var(--green-primary);position:relative;overflow:hidden;}
.farmer-story-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.farmer-story-image{position:relative;}
.farmer-story-image img{width:100%;border-radius:var(--radius-lg);aspect-ratio:4/3;object-fit:cover;opacity:0.92;}
.farmer-story-chip{position:absolute;bottom:20px;left:20px;background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.15);border-radius:var(--radius-md);padding:14px 18px;color:white;}
.farmer-story-chip-name{font-size:15px;font-weight:600;margin-bottom:2px;}
.farmer-story-chip-farm{font-size:12px;opacity:0.75;}
.farmer-story-chip-loc{display:flex;align-items:center;gap:4px;font-size:11px;opacity:0.6;margin-top:4px;}
.farmer-story-label{font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:var(--green-soft);margin-bottom:20px;}
.farmer-story-heading{font-family:var(--font-serif);font-size:clamp(32px,4vw,50px);font-weight:700;line-height:1.15;letter-spacing:-0.02em;color:white;margin-bottom:24px;}
.farmer-story-quote{font-size:16px;color:rgba(255,255,255,0.75);line-height:1.75;border-left:3px solid var(--green-soft);padding-left:20px;margin-bottom:36px;font-style:italic;}
.farmer-bg-circle{position:absolute;border-radius:50%;background:rgba(255,255,255,0.03);pointer-events:none;}

/* SUSTAINABILITY */
#sustainability{padding:var(--section-pad);background:var(--cream-light);}
.sustainability-inner{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;}
.sustainability-heading{font-family:var(--font-serif);font-size:clamp(34px,4vw,52px);font-weight:700;line-height:1.2;letter-spacing:-0.02em;color:var(--text-dark);margin-bottom:32px;}
.sustainability-heading em{font-style:italic;color:var(--green-primary);}
.sustainability-pillars{display:flex;flex-direction:column;gap:20px;}
.pillar{display:flex;align-items:flex-start;gap:16px;}
.pillar-icon{width:40px;height:40px;border-radius:10px;background:var(--green-pale);display:flex;align-items:center;justify-content:center;color:var(--green-primary);font-size:16px;flex-shrink:0;}
.pillar-title{font-size:15px;font-weight:600;color:var(--text-dark);margin-bottom:4px;}
.pillar-desc{font-size:13px;color:var(--text-muted);line-height:1.6;}
.sustainability-image-wrap{position:relative;}
.sustainability-image-wrap img{width:100%;border-radius:var(--radius-lg);aspect-ratio:4/3;object-fit:cover;box-shadow:var(--shadow-lg);}
.sustainability-badge{position:absolute;top:-16px;right:-16px;background:var(--orange);color:white;border-radius:var(--radius-md);padding:14px 18px;text-align:center;box-shadow:var(--shadow-md);}
.sustainability-badge-num{font-family:var(--font-serif);font-size:24px;font-weight:700;display:block;}
.sustainability-badge-text{font-size:11px;font-weight:600;letter-spacing:0.05em;}

/* FINAL CTA */
#final-cta{padding:120px 0;background:var(--beige);position:relative;overflow:hidden;text-align:center;}
.final-cta-eyebrow{font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:var(--green-secondary);margin-bottom:24px;}
.final-cta-heading{font-family:var(--font-serif);font-size:clamp(42px,6vw,72px);font-weight:800;line-height:1.1;letter-spacing:-0.03em;color:var(--text-dark);margin-bottom:20px;}
.final-cta-desc{font-size:17px;color:var(--text-muted);max-width:460px;margin:0 auto 44px;line-height:1.7;}
.final-cta-btns{display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;}
.cta-bg-deco{position:absolute;pointer-events:none;opacity:0.06;font-size:220px;color:var(--green-primary);}
.cta-bg-deco-1{top:-40px;left:-40px;}
.cta-bg-deco-2{bottom:-40px;right:-40px;}

/* FOOTER */
#site-footer{background:var(--text-dark);color:rgba(255,255,255,0.75);padding:72px 0 36px;}
.footer-inner{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:48px;margin-bottom:56px;}
.footer-logo-wrap{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
.footer-logo-icon{width:36px;height:36px;background:var(--green-secondary);border-radius:10px;display:flex;align-items:center;justify-content:center;}
.footer-logo-name{font-family:var(--font-serif);font-size:18px;font-weight:700;color:white;}
.footer-tagline{font-size:12px;color:rgba(255,255,255,0.4);margin-bottom:24px;}
.footer-desc{font-size:13px;line-height:1.7;color:rgba(255,255,255,0.5);margin-bottom:28px;}
.footer-socials{display:flex;gap:10px;}
.footer-social-link{width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);font-size:14px;transition:all var(--t-fast) var(--ease-out);}
.footer-social-link:hover{border-color:var(--green-secondary);color:var(--green-secondary);}
.footer-col-heading{font-size:13px;font-weight:600;color:white;letter-spacing:0.06em;margin-bottom:20px;}
.footer-links{list-style:none;display:flex;flex-direction:column;gap:10px;}
.footer-links a{font-size:13px;color:rgba(255,255,255,0.5);transition:color var(--t-fast);}
.footer-links a:hover{color:rgba(255,255,255,0.85);}
.footer-bottom{border-top:1px solid rgba(255,255,255,0.06);padding-top:28px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
.footer-copyright{font-size:12px;color:rgba(255,255,255,0.35);}
.footer-bottom-links{display:flex;gap:20px;}
.footer-bottom-links a{font-size:12px;color:rgba(255,255,255,0.35);transition:color var(--t-fast);}
.footer-bottom-links a:hover{color:rgba(255,255,255,0.65);}

/* CART SIDEBAR */
#cart-sidebar{position:fixed;top:0;right:-420px;width:420px;height:100%;background:var(--white);z-index:2000;display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(31,33,27,0.12);transition:right 0.4s var(--ease-out);}
#cart-sidebar.open{right:0;}
.cart-header{display:flex;align-items:center;justify-content:space-between;padding:24px 28px;border-bottom:1px solid var(--beige-mid);}
.cart-header-title{font-family:var(--font-serif);font-size:20px;font-weight:600;color:var(--text-dark);}
.cart-close-btn{width:36px;height:36px;border-radius:50%;border:1.5px solid var(--beige-mid);display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);transition:all var(--t-fast);}
.cart-close-btn:hover{border-color:var(--text-dark);color:var(--text-dark);}
#cart-items{flex:1;overflow-y:auto;padding:20px 28px;}
.cart-item{display:grid;grid-template-columns:72px 1fr auto;gap:14px;align-items:center;padding:16px 0;border-bottom:1px solid var(--beige);}
.cart-item img{width:72px;height:72px;object-fit:cover;border-radius:var(--radius-sm);}
.cart-item .info h4{font-size:14px;font-weight:600;color:var(--text-dark);margin-bottom:2px;}
.cart-item .info p{font-size:13px;color:var(--text-muted);}
.cart-item .quantity-control{display:flex;align-items:center;gap:8px;margin-top:8px;}
.cart-item .quantity-control button{width:24px;height:24px;border-radius:50%;border:1px solid var(--beige-mid);background:var(--cream);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;color:var(--text-dark);}
.cart-item .quantity-control span{font-size:14px;font-weight:600;min-width:20px;text-align:center;}
.cart-item .remove-item{color:var(--text-light);font-size:16px;cursor:pointer;background:none;border:none;transition:color var(--t-fast);}
.cart-item .remove-item:hover{color:#e53e3e;}
.cart-footer{padding:20px 28px 28px;border-top:1px solid var(--beige-mid);}
.cart-total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;}
.cart-total-label{font-size:14px;color:var(--text-muted);}
.cart-total-val{font-family:var(--font-serif);font-size:22px;font-weight:700;color:var(--green-primary);}
.cart-checkout-btn{width:100%;padding:16px;background:var(--green-primary);color:white;border:none;border-radius:var(--radius-pill);font-family:var(--font-sans);font-size:15px;font-weight:600;cursor:pointer;transition:all var(--t-fast) var(--ease-out);}
.cart-checkout-btn:hover{background:var(--green-secondary);transform:translateY(-2px);}
#overlay{position:fixed;inset:0;background:rgba(31,33,27,0.4);z-index:1999;opacity:0;pointer-events:none;transition:opacity 0.4s var(--ease-out);}
#overlay.open{opacity:1;pointer-events:all;}
#toast-container{position:fixed;bottom:24px;right:24px;z-index:3000;display:flex;flex-direction:column;gap:10px;}
.toast{background:var(--white);border-radius:var(--radius-md);padding:14px 18px;box-shadow:var(--shadow-lg);display:flex;align-items:center;gap:12px;min-width:280px;font-size:14px;font-weight:500;color:var(--text-dark);animation:toastIn 0.4s var(--ease-out) both;border-left:3px solid var(--green-primary);}
.toast.success{border-color:var(--green-primary);}.toast.warning{border-color:var(--orange);}.toast.error{border-color:#e53e3e;}.toast.info{border-color:#3b82f6;}
@keyframes toastIn{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
.user-greeting{font-size:14px;font-weight:500;color:var(--text-muted);}

/* RESPONSIVE */
@media(max-width:1024px){
    :root{--container-pad:0 32px;}
    .hero-inner{gap:40px;} .hero-heading{font-size:52px;}
    .intro-inner,.how-inner,.farmer-story-inner,.sustainability-inner{gap:48px;}
    .stats-grid{grid-template-columns:repeat(2,1fr);}
    .stat-item:nth-child(2)::after{display:none;}
    .footer-inner{grid-template-columns:1fr 1fr;gap:36px;}
    .produce-layout{grid-template-columns:1fr 1fr;}
    .produce-layout .product-card:first-child{grid-row:auto;}
    .produce-layout .product-card:first-child .product-card-img{height:220px;}
}
@media(max-width:768px){
    :root{--container-pad:0 20px;}
    .nav-links{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:var(--cream);flex-direction:column;align-items:center;justify-content:center;gap:8px;z-index:999;}
    .nav-links.open{display:flex;}
    .nav-links a{font-size:22px;font-weight:600;padding:12px 24px;}
    .hamburger{display:flex;z-index:1001;}
    .nav-logo-tagline{display:none;}
    #site-nav .btn-primary{display:none;}
    #hero{padding:120px 0 60px;}
    .hero-inner{grid-template-columns:1fr;gap:40px;text-align:center;}
    .hero-desc{margin:0 auto 14px;}
    .hero-ctas{justify-content:center;}
    .scroll-indicator{display:none;}
    .hero-right{order:-1;}
    .hero-image-wrap{max-width:320px;margin:0 auto;}
    .natural-badge{right:0;bottom:0;width:80px;height:80px;}
    .natural-badge-pct{font-size:18px;}
    .natural-badge-text{font-size:9px;}
    .hero-farm{height:100px;}
    .trust-ribbon-inner{flex-wrap:wrap;gap:0;}
    .trust-item{padding:10px 16px;}
    .trust-item:not(:last-child){border-right:none;border-bottom:1px solid var(--beige-mid);}
    .trust-item:nth-child(even){border-right:1px solid var(--beige-mid);}
    .intro-inner{grid-template-columns:1fr;gap:40px;}
    .intro-stat-chip{left:10px;bottom:-10px;}
    .produce-layout{grid-template-columns:1fr;}
    .produce-layout .product-card:first-child{grid-row:auto;}
    .how-inner{grid-template-columns:1fr;gap:40px;}
    .how-visual{display:none;}
    .how-steps::before{left:20px;}
    .farmer-story-inner{grid-template-columns:1fr;gap:36px;}
    .stats-grid{grid-template-columns:repeat(2,1fr);}
    .stat-item::after{display:none!important;}
    .stat-item{padding:36px 16px;}
    .stat-number{font-size:38px;}
    .sustainability-inner{grid-template-columns:1fr;gap:40px;}
    .sustainability-badge{top:10px;right:10px;}
    .footer-inner{grid-template-columns:1fr;gap:32px;}
    .footer-bottom{flex-direction:column;text-align:center;}
    #cart-sidebar{width:100%;right:-100%;}
    .section-header{flex-direction:column;align-items:flex-start;}
}
</style>
</head>
<body>

<!-- NAV -->
<nav id="site-nav" role="navigation" aria-label="Main navigation">
    <div class="container">
        <div class="nav-inner">
            <a href="index.html" class="nav-logo" id="nav-logo" aria-label="FreshField Home">
                <div class="nav-logo-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 3C7 3 3 7 3 12C8 12 12 8 12 3Z" fill="white" opacity="0.9"/>
                        <path d="M12 3C17 3 21 7 21 12C16 12 12 8 12 3Z" fill="white" opacity="0.6"/>
                        <path d="M12 12L12 21" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="nav-logo-text">
                    <span class="nav-logo-name">FreshField</span>
                    <span class="nav-logo-tagline">Farm to Your Table</span>
                </div>
            </a>

            <ul class="nav-links" id="nav-links" role="list">
                <li><a href="#hero" class="active">Home</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
                <li><a href="#featured-produce">Products</a></li>
                <li><a href="login.html#register">For Farmers</a></li>
                <li><a href="#intro">About Us</a></li>
                <li><a href="#site-footer">Contact</a></li>
            </ul>

            <div class="nav-actions" id="nav-actions">
                <button class="nav-cart-btn" id="nav-cart-btn" onclick="cart.toggle()" aria-label="Open cart">
                    <i class="fas fa-shopping-basket"></i>
                    <span class="cart-badge" id="cart-count" style="display:none;">0</span>
                </button>
                <div id="nav-auth-btns"></div>
                <a href="#featured-produce" class="btn btn-primary btn-sm" id="nav-cta">
                    <i class="fas fa-leaf"></i> Explore Products
                </a>
            </div>

            <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
    </div>
</nav>

<!-- HERO -->
<section id="hero" aria-labelledby="hero-heading">
    <div class="botanical-decor botanical-tl" aria-hidden="true" id="botanical-tl">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <path d="M20 100 C20 60 60 30 100 20" stroke="#6F9638" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            <path d="M40 80 C40 80 20 60 40 40 C40 40 60 60 40 80Z" stroke="#6F9638" stroke-width="1" fill="#A8BF72" fill-opacity="0.3"/>
            <path d="M60 60 C60 60 40 40 60 20 C60 20 80 40 60 60Z" stroke="#6F9638" stroke-width="1" fill="#A8BF72" fill-opacity="0.2"/>
            <circle cx="20" cy="100" r="3" fill="#F28C28" opacity="0.5"/>
        </svg>
    </div>
    <div class="botanical-decor botanical-tr" aria-hidden="true" id="botanical-tr">
        <svg width="100" height="80" viewBox="0 0 100 80" fill="none">
            <path d="M10 70 C30 50 70 30 90 10" stroke="#A8BF72" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-dasharray="4 3"/>
            <path d="M70 20 C70 20 90 40 70 60 C70 60 50 40 70 20Z" stroke="#6F9638" stroke-width="1" fill="#A8BF72" fill-opacity="0.25"/>
        </svg>
    </div>
    <div class="container">
        <div class="hero-inner">
            <div class="hero-left">
                <div class="hero-eyebrow" id="hero-eyebrow">
                    <span class="eyebrow">
                        <span class="eyebrow-wrap">
                            <svg class="leaf-icon" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.5 2 2 6.5 2 12c5.5 0 10-4.5 10-10z" fill="#6F9638" opacity="0.8"/></svg>
                            FRESH. LOCAL. SUSTAINABLE.
                            <svg class="leaf-icon" viewBox="0 0 24 24" fill="none"><path d="M12 2C17.5 2 22 6.5 22 12c-5.5 0-10-4.5-10-10z" fill="#6F9638" opacity="0.8"/></svg>
                        </span>
                    </span>
                </div>
                <h1 class="hero-heading" id="hero-heading">
                    Real Produce,<br>
                    Real <span class="accent">Impact.</span>
                </h1>
                <p class="hero-desc" id="hero-desc">
                    A direct marketplace connecting local farmers<br>with conscious consumers.
                </p>
                <svg class="hero-squiggle" id="hero-squiggle" width="64" height="12" viewBox="0 0 64 12" fill="none" aria-hidden="true">
                    <path d="M2 6 C8 2 14 10 20 6 C26 2 32 10 38 6 C44 2 50 10 56 6 C60 2 62 6 62 6" stroke="#F28C28" stroke-width="2" fill="none" stroke-linecap="round"/>
                </svg>
                <div class="hero-ctas">
                    <a href="#featured-produce" class="btn btn-primary btn-lg" id="hero-cta-1">
                        <i class="fas fa-leaf"></i> Shop Fresh Now
                    </a>
                    <a href="#how-it-works" class="btn-ghost-link" id="hero-cta-2">
                        <span class="play-circle"><i class="fas fa-play" style="font-size:10px;margin-left:2px;"></i></span>
                        <span class="ghost-text">
                            <strong>See How It Works</strong>
                            <small>Watch the video</small>
                        </span>
                    </a>
                </div>
                <div class="scroll-indicator" id="scroll-indicator" aria-hidden="true">
                    <span class="scroll-text">SCROLL<br>DOWN</span>
                    <div class="scroll-mouse"><div class="scroll-mouse-dot"></div></div>
                    <div class="scroll-dot"></div>
                </div>
            </div>
            <div class="hero-right">
                <div class="hero-image-wrap">
                    <div class="hero-blob-bg" aria-hidden="true"></div>
                    <div class="hero-image-blob" id="hero-image">
                        <img src="assets/images/hero-produce.png" alt="Fresh organic vegetables in a wooden crate - tomatoes, carrots, broccoli and leafy greens" id="hero-produce-img" loading="eager">
                    </div>
                    <div class="natural-badge" id="natural-badge" aria-label="100% Natural produce">
                        <span class="natural-badge-pct">100%</span>
                        <span class="natural-badge-text">NATURAL</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="hero-farm" aria-hidden="true">
        <img src="assets/images/farm-landscape.png" alt="" loading="eager">
    </div>
</section>

<!-- STATISTICS -->
<section id="statistics" aria-labelledby="stats-heading">
    <h2 id="stats-heading" class="sr-only">FreshField by the numbers</h2>
    <div class="container">
        <div class="stats-grid">
            <div class="stat-item reveal-up">
                <div class="stat-icon" aria-hidden="true"><i class="fas fa-users"></i></div>
                <div class="stat-number"><span class="counter" data-target="1200">0</span><span class="stat-suffix">+</span></div>
                <div class="stat-label">Happy Customers</div>
                <div class="stat-underline"></div>
            </div>
            <div class="stat-item reveal-up delay-1">
                <div class="stat-icon" aria-hidden="true"><i class="fas fa-leaf"></i></div>
                <div class="stat-number"><span class="counter" data-target="350">0</span><span class="stat-suffix">+</span></div>
                <div class="stat-label">Local Farmers</div>
                <div class="stat-underline"></div>
            </div>
            <div class="stat-item reveal-up delay-2">
                <div class="stat-icon" aria-hidden="true"><i class="fas fa-shopping-basket"></i></div>
                <div class="stat-number"><span class="counter" data-target="2500">0</span><span class="stat-suffix">+</span></div>
                <div class="stat-label">Fresh Products</div>
                <div class="stat-underline"></div>
            </div>
            <div class="stat-item reveal-up delay-3">
                <div class="stat-icon" aria-hidden="true"><i class="fas fa-map-marker-alt"></i></div>
                <div class="stat-number"><span class="counter" data-target="50">0</span><span class="stat-suffix">+</span></div>
                <div class="stat-label">Cities Served</div>
                <div class="stat-underline"></div>
            </div>
        </div>
    </div>
</section>

<!-- TRUST RIBBON -->
<div id="trust-ribbon" role="complementary" aria-label="Our values">
    <div class="container">
        <div class="trust-ribbon-inner">
            <div class="trust-item"><div class="trust-icon" aria-hidden="true"><i class="fas fa-user-slash"></i></div><span class="trust-label">No Middlemen</span></div>
            <div class="trust-item"><div class="trust-icon" aria-hidden="true"><i class="fas fa-tag"></i></div><span class="trust-label">Fair Prices</span></div>
            <div class="trust-item"><div class="trust-icon" aria-hidden="true"><i class="fas fa-seedling"></i></div><span class="trust-label">Sustainable Farming</span></div>
            <div class="trust-item"><div class="trust-icon" aria-hidden="true"><i class="fas fa-home"></i></div><span class="trust-label">Direct to Your Home</span></div>
        </div>
    </div>
</div>

<!-- INTRO -->
<section id="intro" aria-labelledby="intro-heading">
    <div class="container">
        <div class="intro-inner">
            <div class="reveal-up">
                <span class="intro-label">About FreshField</span>
                <h2 class="intro-heading" id="intro-heading">Freshness Has<br>A Source.</h2>
                <p class="intro-body">FreshField connects customers directly with local farmers, helping you discover fresh produce while giving farmers a better way to reach buyers. No unnecessary steps, no hidden costs â€” just real food and real relationships.</p>
                <a href="#featured-produce" class="btn btn-primary">Discover Fresh Produce <i class="fas fa-arrow-right"></i></a>
                <div class="intro-organic-line"></div>
            </div>
            <div class="intro-image-wrap reveal-up delay-2">
                <img src="assets/images/hero-produce.png" alt="Fresh vegetables from local farms" loading="lazy">
                <div class="intro-stat-chip">
                    <div>
                        <div class="intro-stat-chip-number">98%</div>
                        <div class="intro-stat-chip-label">Customer<br>Satisfaction</div>
                    </div>
                    <i class="fas fa-star" style="color:var(--orange);font-size:20px;"></i>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- FEATURED PRODUCE -->
<section id="featured-produce" aria-labelledby="produce-heading">
    <div class="container">
        <div class="section-header reveal-up">
            <div>
                <div class="section-heading-label">From the Market</div>
                <h2 class="section-heading" id="produce-heading">Fresh Picks<br>From Local Farms</h2>
            </div>
            <a href="customer-dashboard.html" class="btn btn-outline">View All Products <i class="fas fa-arrow-right"></i></a>
        </div>
        <div id="products-grid" class="produce-layout" role="list" aria-live="polite" aria-label="Featured products">
            <div class="product-skeleton reveal-up"><div class="product-skeleton-img skeleton"></div><div class="product-skeleton-body"><div class="product-skeleton-line short skeleton"></div><div class="product-skeleton-line long skeleton" style="margin-bottom:16px;"></div><div class="product-skeleton-line skeleton" style="width:40%;height:12px;"></div></div></div>
            <div class="product-skeleton reveal-up delay-1"><div class="product-skeleton-img skeleton" style="height:180px;"></div><div class="product-skeleton-body"><div class="product-skeleton-line short skeleton"></div><div class="product-skeleton-line long skeleton" style="margin-bottom:16px;"></div><div class="product-skeleton-line skeleton" style="width:40%;height:12px;"></div></div></div>
            <div class="product-skeleton reveal-up delay-2"><div class="product-skeleton-img skeleton" style="height:180px;"></div><div class="product-skeleton-body"><div class="product-skeleton-line short skeleton"></div><div class="product-skeleton-line long skeleton" style="margin-bottom:16px;"></div><div class="product-skeleton-line skeleton" style="width:40%;height:12px;"></div></div></div>
        </div>
    </div>
</section>

<!-- HOW IT WORKS -->
<section id="how-it-works" aria-labelledby="how-heading">
    <div class="container">
        <div class="how-inner">
            <div class="reveal-up">
                <div class="section-heading-label" style="margin-bottom:12px;">Simple Process</div>
                <h2 class="section-heading" id="how-heading" style="margin-bottom:40px;">How FreshField<br>Works</h2>
                <div class="how-steps">
                    <div class="how-step">
                        <div class="how-step-number" aria-label="Step 1">01</div>
                        <div class="how-step-content">
                            <div class="how-step-tag">Step One</div>
                            <h3 class="how-step-title">Discover</h3>
                            <p class="how-step-desc">Explore fresh seasonal produce from verified local farmers in your area.</p>
                        </div>
                    </div>
                    <div class="how-step">
                        <div class="how-step-number" aria-label="Step 2">02</div>
                        <div class="how-step-content">
                            <div class="how-step-tag">Step Two</div>
                            <h3 class="how-step-title">Choose</h3>
                            <p class="how-step-desc">Select what you want. Add products to your cart with complete transparency.</p>
                        </div>
                    </div>
                    <div class="how-step">
                        <div class="how-step-number" aria-label="Step 3">03</div>
                        <div class="how-step-content">
                            <div class="how-step-tag">Step Three</div>
                            <h3 class="how-step-title">Receive</h3>
                            <p class="how-step-desc">Get fresh produce delivered directly from the source â€” as nature intended.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="how-visual reveal-up delay-3">
                <img src="assets/images/hero-produce.png" alt="Fresh vegetables ready for delivery" loading="lazy">
                <div class="how-visual-card">
                    <div class="how-visual-card-icon"><i class="fas fa-bolt"></i></div>
                    <div class="how-visual-card-text"><strong>Fast Delivery</strong><span>Same-day fresh pick</span></div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- FARMER STORY -->
<section id="farmer-story" aria-labelledby="farmer-heading">
    <div class="farmer-bg-circle" style="top:-60px;right:-60px;width:300px;height:300px;" aria-hidden="true"></div>
    <div class="farmer-bg-circle" style="bottom:-40px;left:-40px;width:200px;height:200px;" aria-hidden="true"></div>
    <div class="container">
        <div class="farmer-story-inner">
            <div class="farmer-story-image reveal-up">
                <img src="assets/images/farmer-story.png" alt="Aerial view of organic farm fields" loading="lazy">
                <div class="farmer-story-chip">
                    <div class="farmer-story-chip-name">Rajesh Kumar</div>
                    <div class="farmer-story-chip-farm">Green Valley Organic Farm</div>
                    <div class="farmer-story-chip-loc"><i class="fas fa-map-marker-alt" style="font-size:10px;"></i> Punjab, India</div>
                </div>
            </div>
            <div class="farmer-story-content reveal-up delay-2">
                <div class="farmer-story-label">Know Your Farmer</div>
                <h2 class="farmer-story-heading" id="farmer-heading">Know Where Your Food Comes From.</h2>
                <p class="farmer-story-quote">"I have been farming this land for twenty years. FreshField gave me a way to reach families directly â€” people who care about where their food comes from, just as much as I do."</p>
                <a href="login.html#register" class="btn btn-outline" style="border-color:rgba(255,255,255,0.4);color:white;">
                    <i class="fas fa-tractor"></i> Meet Our Farmers
                </a>
            </div>
        </div>
    </div>
</section>

<!-- SUSTAINABILITY -->
<section id="sustainability" aria-labelledby="sustainability-heading">
    <div class="container">
        <div class="sustainability-inner">
            <div class="reveal-up">
                <h2 class="sustainability-heading" id="sustainability-heading">
                    Better For Farmers.<br>Better For <em>You.</em><br>Better For Tomorrow.
                </h2>
                <div class="sustainability-pillars">
                    <div class="pillar"><div class="pillar-icon" aria-hidden="true"><i class="fas fa-handshake"></i></div><div><div class="pillar-title">Direct Relationships</div><p class="pillar-desc">Buyers and farmers connect directly, building trust and community.</p></div></div>
                    <div class="pillar"><div class="pillar-icon" aria-hidden="true"><i class="fas fa-balance-scale"></i></div><div><div class="pillar-title">Fairer Value</div><p class="pillar-desc">Farmers earn more. Customers pay less. No middleman markup.</p></div></div>
                    <div class="pillar"><div class="pillar-icon" aria-hidden="true"><i class="fas fa-map-pin"></i></div><div><div class="pillar-title">Locally Grown</div><p class="pillar-desc">Supporting local agriculture strengthens communities and reduces food miles.</p></div></div>
                    <div class="pillar"><div class="pillar-icon" aria-hidden="true"><i class="fas fa-recycle"></i></div><div><div class="pillar-title">Less Waste</div><p class="pillar-desc">Direct ordering means produce is harvested to demand, not over-produced.</p></div></div>
                </div>
            </div>
            <div class="sustainability-image-wrap reveal-up delay-2">
                <img src="assets/images/farmer-story.png" alt="Sustainable organic farm" loading="lazy">
                <div class="sustainability-badge"><span class="sustainability-badge-num">100%</span><span class="sustainability-badge-text">Organic</span></div>
            </div>
        </div>
    </div>
</section>

<!-- FINAL CTA -->
<section id="final-cta" aria-labelledby="cta-heading">
    <div class="cta-bg-deco cta-bg-deco-1" aria-hidden="true">ðŸŒ¿</div>
    <div class="cta-bg-deco cta-bg-deco-2" aria-hidden="true">ðŸŒ¿</div>
    <div class="container" style="position:relative;z-index:2;">
        <div class="reveal-up">
            <p class="final-cta-eyebrow">Join FreshField Today</p>
            <h2 class="final-cta-heading" id="cta-heading">Bring The Farm<br>Closer To Home.</h2>
            <p class="final-cta-desc">Discover fresh produce from farmers who grow it. Support local. Eat better.</p>
            <div class="final-cta-btns">
                <a href="customer-dashboard.html" class="btn btn-primary btn-lg"><i class="fas fa-leaf"></i> Explore Fresh Produce</a>
                <a href="login.html#register" class="btn btn-outline btn-lg"><i class="fas fa-tractor"></i> Join as a Farmer</a>
            </div>
        </div>
    </div>
</section>

<!-- FOOTER -->
<footer id="site-footer" role="contentinfo">
    <div class="container">
        <div class="footer-inner">
            <div>
                <div class="footer-logo-wrap">
                    <div class="footer-logo-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3C7 3 3 7 3 12C8 12 12 8 12 3Z" fill="white" opacity="0.9"/><path d="M12 3C17 3 21 7 21 12C16 12 12 8 12 3Z" fill="white" opacity="0.6"/><path d="M12 12L12 21" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg></div>
                    <span class="footer-logo-name">FreshField</span>
                </div>
                <p class="footer-tagline">Farm to Your Table</p>
                <p class="footer-desc">A direct marketplace connecting conscious consumers with local farmers. Fresh produce, fair prices, real impact.</p>
                <div class="footer-socials" role="list" aria-label="Social media links">
                    <a href="#" class="footer-social-link" aria-label="Instagram" role="listitem"><i class="fab fa-instagram"></i></a>
                    <a href="#" class="footer-social-link" aria-label="Facebook" role="listitem"><i class="fab fa-facebook-f"></i></a>
                    <a href="#" class="footer-social-link" aria-label="Twitter" role="listitem"><i class="fab fa-twitter"></i></a>
                    <a href="#" class="footer-social-link" aria-label="WhatsApp" role="listitem"><i class="fab fa-whatsapp"></i></a>
                </div>
            </div>
            <div>
                <h3 class="footer-col-heading">Marketplace</h3>
                <ul class="footer-links" role="list">
                    <li><a href="#featured-produce">Fresh Products</a></li>
                    <li><a href="customer-dashboard.html">All Products</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="#">Seasonal Picks</a></li>
                    <li><a href="#">Categories</a></li>
                </ul>
            </div>
            <div>
                <h3 class="footer-col-heading">For Farmers</h3>
                <ul class="footer-links" role="list">
                    <li><a href="login.html#register">Join as Farmer</a></li>
                    <li><a href="farmer-dashboard.html">Farmer Dashboard</a></li>
                    <li><a href="#">Farmer Guide</a></li>
                    <li><a href="#">Success Stories</a></li>
                </ul>
            </div>
            <div>
                <h3 class="footer-col-heading">Company</h3>
                <ul class="footer-links" role="list">
                    <li><a href="#intro">About Us</a></li>
                    <li><a href="#">Contact</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Sustainability</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p class="footer-copyright">&copy; 2025 FreshField. All rights reserved.</p>
            <div class="footer-bottom-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></div>
        </div>
    </div>
</footer>

<!-- CART -->
<aside id="cart-sidebar" role="complementary" aria-label="Shopping cart">
    <div class="cart-header">
        <h2 class="cart-header-title">Your Basket</h2>
        <button class="cart-close-btn" onclick="cart.close()" aria-label="Close cart"><i class="fas fa-times"></i></button>
    </div>
    <div id="cart-items"></div>
    <div class="cart-footer">
        <div class="cart-total-row"><span class="cart-total-label">Total</span><span class="cart-total-val" id="cart-total">$0.00</span></div>
        <button class="cart-checkout-btn" onclick="handleCheckout()">Proceed to Checkout <i class="fas fa-arrow-right"></i></button>
    </div>
</aside>
<div id="overlay" onclick="cart.close()" role="presentation"></div>
<div id="toast-container" role="alert" aria-live="polite"></div>

<script src="js/toast.js"></script>
<script src="js/api.js"></script>
<script src="js/auth.js"></script>
<script src="js/cart.js"></script>
<script>
/* === FRESHFIELD HOME PAGE JS === */

// FALLBACK DEMO PRODUCTS (used when backend API is unavailable)
const FALLBACK_PRODUCTS = [
    {
        id: 'demo-1',
        name: 'Fresh Tomatoes',
        price: 80,
        unit: 'kg',
        farm_name: 'Green Valley Farm',
        farmer_name: 'Rajesh Patel',
        category: 'Vegetables',
        image_url: 'assets/images/tomatoes.png'
    },
    {
        id: 'demo-2',
        name: 'Organic Carrots',
        price: 70,
        unit: 'kg',
        farm_name: 'Sunrise Organics',
        farmer_name: 'Mehul Shah',
        category: 'Vegetables',
        image_url: 'assets/images/carrots.png'
    },
    {
        id: 'demo-3',
        name: 'Fresh Spinach',
        price: 40,
        unit: 'bunch',
        farm_name: 'Hariyali Farm',
        farmer_name: 'Amit Patel',
        category: 'Leafy Greens',
        image_url: 'assets/images/spinach.png'
    },
    {
        id: 'demo-4',
        name: 'Farm Fresh Potatoes',
        price: 50,
        unit: 'kg',
        farm_name: 'Earth Harvest Farm',
        farmer_name: 'Kiran Patel',
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
        fallback_local: 'assets/images/hero-produce.png'
    },
    {
        id: 'demo-5',
        name: 'Fresh Mangoes',
        price: 120,
        unit: 'kg',
        farm_name: 'Mango Valley Farm',
        farmer_name: 'Dhruv Patel',
        category: 'Fruits',
        image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80',
        fallback_local: 'assets/images/hero-produce.png'
    },
    {
        id: 'demo-6',
        name: 'Fresh Bell Peppers',
        price: 100,
        unit: 'kg',
        farm_name: 'Green Roots Farm',
        farmer_name: 'Nilesh Shah',
        category: 'Vegetables',
        image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80',
        fallback_local: 'assets/images/hero-produce.png'
    }
];

// PAGE ENTRANCE SEQUENCE
(function pageEntrance(){
    const seq=[
        {id:'nav-logo',d:100},{id:'nav-links',d:200},{id:'nav-actions',d:250},
        {id:'hamburger',d:250},{id:'hero-eyebrow',d:400},{id:'hero-heading',d:500},
        {id:'hero-desc',d:600},{id:'hero-squiggle',d:650},{id:'hero-cta-1',d:800},
        {id:'hero-cta-2',d:850},{id:'hero-image',d:900},{id:'botanical-tl',d:1000},
        {id:'botanical-tr',d:1050},{id:'natural-badge',d:1100},{id:'nav-cta',d:1150},
        {id:'scroll-indicator',d:1200}
    ];
    seq.forEach(({id})=>{
        const n=document.getElementById(id);
        if(n){n.style.opacity='0';n.style.transform='translateY(16px)';n.style.transition='opacity 0.6s cubic-bezier(0.16,1,0.3,1),transform 0.6s cubic-bezier(0.16,1,0.3,1)';}
    });
    seq.forEach(({id,d})=>{
        setTimeout(()=>{
            const n=document.getElementById(id);
            if(n){n.style.opacity='1';n.style.transform='translateY(0)';}
        },d);
    });
    setTimeout(()=>{
        ['botanical-tl','botanical-tr'].forEach(id=>{
            const n=document.getElementById(id);
            if(n)n.classList.add('visible');
        });
    },1000);
    setTimeout(()=>{
        const img=document.getElementById('hero-produce-img');
        if(img)img.classList.add('img-loaded');
    },900);
})();

document.addEventListener('DOMContentLoaded',function(){
    auth.initAuth();
    setupNavScroll();
    setupHamburger();
    setupScrollReveal();
    setupCounters();
    updateNavAuth();
    loadFeaturedProducts();
    patchCartUI();
});

function setupNavScroll(){
    const nav=document.getElementById('site-nav');
    window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>60),{passive:true});
}

function setupHamburger(){
    const btn=document.getElementById('hamburger'),links=document.getElementById('nav-links');
    if(!btn||!links)return;
    btn.addEventListener('click',()=>{
        const open=links.classList.toggle('open');
        btn.classList.toggle('active',open);
        btn.setAttribute('aria-expanded',open);
        document.body.style.overflow=open?'hidden':'';
    });
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
        links.classList.remove('open');btn.classList.remove('active');
        btn.setAttribute('aria-expanded','false');document.body.style.overflow='';
    }));
}

function setupScrollReveal(){
    const els=document.querySelectorAll('.reveal-up');
    const obs=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}});
    },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
    els.forEach(el=>obs.observe(el));
}

function setupCounters(){
    const counters=document.querySelectorAll('.counter');
    const obs=new IntersectionObserver((entries)=>{
        entries.forEach(e=>{if(e.isIntersecting){animateCounter(e.target,parseInt(e.target.dataset.target));obs.unobserve(e.target);}});
    },{threshold:0.5});
    counters.forEach(el=>obs.observe(el));
}

function animateCounter(el,target){
    const dur=1800,start=performance.now();
    function tick(now){
        const p=Math.min((now-start)/dur,1),ease=1-Math.pow(1-p,3);
        el.textContent=Math.floor(ease*target).toLocaleString();
        if(p<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

function updateNavAuth(){
    const c=document.getElementById('nav-auth-btns');
    if(!c)return;
    const user=auth.getCurrentUser();
    if(auth.isAuthenticated()&&user){
        const dash=user.role==='farmer'?'farmer-dashboard.html':'customer-dashboard.html';
        c.innerHTML=`<span class="user-greeting">Hi, ${user.name?user.name.split(' ')[0]:'there'}</span>
        <a href="${dash}" class="btn btn-outline btn-sm"><i class="fas fa-tachometer-alt"></i> Dashboard</a>`;
    }else{
        c.innerHTML=`<a href="login.html" style="font-size:14px;font-weight:500;color:var(--text-muted);padding:8px 12px;text-decoration:none;">Login</a>
        <a href="login.html#register" class="btn btn-outline btn-sm">Register</a>`;
    }
}

function patchCartUI(){
    const badge=document.getElementById('cart-count');
    if(!badge)return;
    function refresh(){
        const count=cart.getTotalItems?cart.getTotalItems():0;
        badge.textContent=count;
        badge.style.display=count>0?'flex':'none';
        if(count>0){badge.classList.add('bump');setTimeout(()=>badge.classList.remove('bump'),400);}
    }
    const orig=cart.save.bind(cart);
    cart.save=function(){orig();refresh();};
    refresh();
}

async function loadFeaturedProducts(){
    const grid=document.getElementById('products-grid');
    if(!grid)return;
    try{
        const res=await API.products.getAll({limit:6});
        const prods=res.products||res.data||res||[];
        if(Array.isArray(prods)&&prods.length>0){
            renderProducts(grid,prods.slice(0,6));
        }else{
            renderProducts(grid,FALLBACK_PRODUCTS);
        }
    }catch(err){
        // API offline/unavailable - render fallback products seamlessly (no error UI)
        renderProducts(grid,FALLBACK_PRODUCTS);
    }
    setupScrollReveal();
}

function renderProducts(container,products){
    container.innerHTML=products.map((p,i)=>{
        let imgUrl=p.image_url||'';
        if(imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('assets/')){
            imgUrl=`http://localhost:5000${imgUrl}`;
        }
        const fallbackImg=p.fallback_local||'assets/images/hero-produce.png';
        const price=parseFloat(p.price).toFixed(2);
        const farmer=p.farmer_name||p.farmer||'Local Farmer';
        const farm=p.farm_name||'';
        const unit=p.unit||'kg';
        const cat=p.category||'Vegetables';
        const pData=JSON.stringify({id:p.id,name:p.name,price:p.price,image_url:imgUrl||fallbackImg,farmer_name:farmer,quantity:p.quantity||999}).replace(/'/g,"&#39;");

        return `<article class="product-card reveal-up${i>0?' delay-'+(i>5?5:i):''}" role="listitem" onclick="onProductCardClick('${p.id}')">
            <div class="product-card-img">
                ${imgUrl?`<img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.onerror=null;this.src='${fallbackImg}';">`:
                `<img src="${fallbackImg}" alt="${p.name}" loading="lazy">`}
                <span class="product-card-badge">${cat}</span>
            </div>
            <div class="product-card-body">
                <div class="product-card-farm"><i class="fas fa-map-marker-alt" style="font-size:9px;"></i>${farm?farm+' &bull; ':''}${farmer}</div>
                <h3 class="product-card-name">${p.name}</h3>
                <div class="product-card-footer">
                    <div><span class="product-card-price">&#8377;${price}</span><span class="product-card-unit"> / ${unit}</span></div>
                    <button class="product-add-btn" onclick='event.stopPropagation();addProductToCart(${pData})' aria-label="Add ${p.name} to cart" title="Add to cart"><i class="fas fa-plus"></i></button>
                </div>
            </div>
        </article>`;
    }).join('');
}

function onProductCardClick(id){
    if(id && !id.toString().startsWith('demo-')){
        window.location.href = `customer-dashboard.html?product=${id}`;
    }else{
        window.location.href = 'customer-dashboard.html';
    }
}

function addProductToCart(product){
    if(!auth.isAuthenticated()){
        if(typeof toast!=='undefined')toast.info('Please log in to add items to your cart.');
        setTimeout(()=>window.location.href='login.html',1200);
        return;
    }
    cart.addItem({
        id:product.id,
        name:product.name,
        price:parseFloat(product.price),
        image:product.image_url||'assets/images/hero-produce.png',
        farmer:product.farmer_name||'Local Farmer',
        maxQuantity:product.quantity||999
    });
}

function handleCheckout(){
    if(!auth.isAuthenticated()){cart.close();window.location.href='login.html';return;}
    const user=auth.getCurrentUser();
    cart.close();
    window.location.href=user&&user.role==='farmer'?'farmer-dashboard.html':'customer-dashboard.html';
}

// Active nav on scroll
(function(){
    const sections=['hero','statistics','intro','featured-produce','how-it-works','farmer-story','sustainability','final-cta'];
    const links=document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll',()=>{
        let cur='';
        sections.forEach(id=>{const el=document.getElementById(id);if(el&&window.scrollY>=el.offsetTop-140)cur=id;});
        links.forEach(a=>{a.classList.remove('active');if(a.getAttribute('href')==='#'+cur)a.classList.add('active');});
    },{passive:true});
})();
</script>
</body>
</html>

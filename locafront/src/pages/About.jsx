// src/components/AboutMediaOn.jsx
import React from "react"
import "./About.css"

function Hero() {
  return (
    <header className="hero" id="hero">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <div className="hero-badge">
              <div className="hero-badge-dot"></div>
              Agence digitale • Beni Mellal
            </div>

            <h1 className="hero-title">
              Nous créons des expériences digitales{" "}
              <span className="highlight">qui convertissent</span>.
            </h1>

            <p className="hero-subtitle">
              MediaON accompagne les entreprises marocaines dans la création de
              sites web performants, le SEO, la publicité en ligne et la gestion
              des réseaux sociaux pour transformer la visibilité en résultats.
            </p>

            <div className="hero-meta-mini">
              <div>
                <strong>Approche 360°</strong>
                Site, SEO, Ads & contenu alignés sur vos objectifs business.
              </div>
              <div>
                <strong>Focus ROI</strong>
                Pas seulement du design, mais des actions mesurables qui
                génèrent des leads.
              </div>
            </div>

            <div className="hero-actions">
              <a href="#contact" className="btn btn-pill-primary">
                <i className="bi bi-rocket-takeoff me-1"></i> Lancer mon projet
              </a>
              <a
                href="https://mediaon.ma"
                target="_blank"
                rel="noreferrer"
                className="btn btn-pill-outline"
              >
                <i className="bi bi-box-arrow-up-right me-1"></i> Voir le site
                MediaON
              </a>
            </div>
          </div>

          <div className="col-lg-6 hero-right">
            <div className="hero-media-card">
              <div className="hero-media-tag">Studio & Growth</div>
              <div className="hero-media-title">
                Une équipe créative + technique à vos côtés
              </div>
              <div className="hero-media-sub">
                Création, optimisation et automatisation de votre présence en
                ligne, avec un seul interlocuteur.
              </div>

              <div className="hero-lottie mt-3">
                <lottie-player
                  src="https://assets9.lottiefiles.com/packages/lf20_3rwasyjy.json"
                  background="transparent"
                  speed="1"
                  loop
                  autoplay
                  style={{ width: "100%", height: "190px" }}
                ></lottie-player>
              </div>

              <div className="hero-thumb-row">
                <div className="hero-thumb">
                  <img
                    src="https://images.pexels.com/photos/6476584/pexels-photo-6476584.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="UI design dashboard"
                  />
                </div>
                <div className="hero-thumb">
                  <img
                    src="https://images.pexels.com/photos/6476808/pexels-photo-6476808.jpeg?auto=compress&cs=tinysrgb&w=600"
                    alt="Digital marketing team"
                  />
                </div>
                <div className="hero-thumb-text">
                  <strong>MediaON Studio</strong>
                  <br />
                  Design UI/UX, intégration, campagnes et reporting dans un même
                  écosystème.
                </div>
              </div>

              <div className="hero-kpi">
                <div>
                  <i className="bi bi-check2-circle me-1"></i> +95% de projets
                  livrés dans les délais
                </div>
                <div>
                  <i className="bi bi-graph-up-arrow me-1"></i> Croissance
                  mesurable
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function MissionSection() {
  return (
    <section className="section" id="mission">
      <div className="container">
        <div className="row g-4 mb-3">
          <div className="col-lg-5">
            <h2 className="section-title">Pourquoi MediaON&nbsp;?</h2>
            <p className="section-lead">
              Nous pensons qu’un bon site web ne doit pas seulement être beau.
              Il doit être rapide, clair, rassurant, et guidé par une vraie
              stratégie digitale.
            </p>
          </div>
          <div className="col-lg-7">
            <div className="stats-strip">
              <div className="stat-item">
                <div className="stat-value">+7</div>
                <div className="stat-label">années d’expérience digitale</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">360°</div>
                <div className="stat-label">
                  stratégie (Site, SEO, Ads, Social)
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-value">1</div>
                <div className="stat-label">
                  interlocuteur unique pour tout votre digital
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card-soft">
              <div className="card-soft-icon">
                <i className="bi bi-bullseye"></i>
              </div>
              <h3>Notre mission</h3>
              <p>
                Accompagner les entrepreneurs, PME et projets innovants à
                gagner en visibilité, crédibilité et performance en ligne.
              </p>
              <div className="pill-list">
                <span className="pill">Langage simple</span>
                <span className="pill">Accompagnement humain</span>
                <span className="pill">Résultats concrets</span>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card-soft">
              <div className="card-soft-icon">
                <i className="bi bi-eye"></i>
              </div>
              <h3>Notre vision</h3>
              <p>
                Faire du digital un levier de croissance accessible, mesurable
                et durable pour les entreprises marocaines.
              </p>
              <div className="pill-list">
                <span className="pill">UX &amp; UI</span>
                <span className="pill">Data &amp; analytics</span>
                <span className="pill">Optimisation continue</span>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card-soft">
              <div className="card-soft-icon">
                <i className="bi bi-heart-pulse"></i>
              </div>
              <h3>Nos valeurs</h3>
              <p>
                Transparence, pédagogie, réactivité et exigence sur la qualité
                des livrables sont au cœur de chaque projet.
              </p>
              <div className="pill-list">
                <span className="pill">Clarté</span>
                <span className="pill">Proximité</span>
                <span className="pill">Fiabilité</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
          <div>
            <h2 className="section-title">
              Ce que nous construisons avec vous
            </h2>
            <p className="section-lead">
              Des sites web, des tunnels de conversion, des campagnes et des
              contenus qui parlent vraiment à vos clients, avec une identité
              visuelle cohérente.
            </p>
          </div>
          <div className="text-md-end">
            <span className="badge rounded-pill bg-light text-dark border">
              <i className="bi bi-stars text-warning me-1"></i> Pack complet
              site + référencement + ads disponible
            </span>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="card-soft">
              <div className="card-soft-icon">
                <i className="bi bi-window-sidebar"></i>
              </div>
              <h3>Sites vitrines &amp; e-commerce</h3>
              <p>
                Designs modernes, responsive et optimisés pour la conversion,
                intégrés avec vos outils (mail, CRM, paiement).
              </p>
              <div className="pill-list">
                <span className="pill">WordPress</span>
                <span className="pill">WooCommerce</span>
                <span className="pill">Performance</span>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card-soft">
              <div className="card-soft-icon">
                <i className="bi bi-search"></i>
              </div>
              <h3>SEO &amp; contenu</h3>
              <p>
                Audit, mots-clés, structure et rédaction optimisée pour vous
                aider à remonter dans Google durablement.
              </p>
              <div className="pill-list">
                <span className="pill">SEO technique</span>
                <span className="pill">On-page</span>
                <span className="pill">Blog</span>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card-soft">
              <div className="card-soft-icon">
                <i className="bi bi-badge-ad"></i>
              </div>
              <h3>Ads &amp; acquisition</h3>
              <p>
                Campagnes ciblées sur Google, Facebook &amp; Instagram pour
                générer des leads qualifiés et traçables.
              </p>
              <div className="pill-list">
                <span className="pill">Google Ads</span>
                <span className="pill">Meta Ads</span>
                <span className="pill">Tracking</span>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card-soft">
              <div className="card-soft-icon">
                <i className="bi bi-brush"></i>
              </div>
              <h3>Branding &amp; social media</h3>
              <p>
                Identité visuelle, templates de posts, lignes éditoriales et
                stories pour nourrir votre présence au quotidien.
              </p>
              <div className="pill-list">
                <span className="pill">Logo</span>
                <span className="pill">Charte</span>
                <span className="pill">Social kit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  return (
    <section className="section" id="approche">
      <div className="container">
        <div className="row g-4 align-items-start">
          <div className="col-lg-5">
            <h2 className="section-title">
              Une méthodologie claire, étape par étape
            </h2>
            <p className="section-lead">
              Pour chaque projet, nous avançons dans un cadre précis pour éviter
              les surprises, respecter les délais et garder une vision claire
              des objectifs.
            </p>
          </div>
          <div className="col-lg-7">
            <div className="card-soft">
              <div className="step-item">
                <div className="step-index">01</div>
                <div>
                  <div className="step-title">Diagnostic &amp; cadrage</div>
                  <div className="step-text">
                    Atelier pour comprendre votre activité, vos clients, vos
                    concurrents et votre positionnement.
                  </div>
                </div>
              </div>
              <div className="step-item">
                <div className="step-index">02</div>
                <div>
                  <div className="step-title">
                    UX, maquettes &amp; contenus
                  </div>
                  <div className="step-text">
                    Architecture de pages, wireframes, design UI et rédaction de
                    contenus orientés conversion.
                  </div>
                </div>
              </div>
              <div className="step-item">
                <div className="step-index">03</div>
                <div>
                  <div className="step-title">
                    Développement &amp; intégration
                  </div>
                  <div className="step-text">
                    Intégration sous WordPress ou autre stack, optimisations de
                    vitesse, tests multi-devices.
                  </div>
                </div>
              </div>
              <div className="step-item mb-0">
                <div className="step-index">04</div>
                <div>
                  <div className="step-title">
                    Lancement &amp; croissance
                  </div>
                  <div className="step-text">
                    Mise en ligne, configuration des outils d’analyse, lancement
                    de campagnes SEO/Ads et suivi régulier.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="section" id="contact">
      <div className="container">
        <div className="cta-band">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <h2 className="cta-title">
                Prêt à structurer sérieusement votre présence digitale&nbsp;?
              </h2>
              <p className="cta-text">
                Nous pouvons vous aider à clarifier votre offre, concevoir votre
                site, piloter vos campagnes et suivre vos résultats avec des
                indicateurs simples.
              </p>
              <div className="cta-actions">
                <a
                  href="mailto:info@mediaon.ma"
                  className="btn btn-cta-light"
                >
                  <i className="bi bi-envelope-paper-heart me-1"></i> Écrire à
                  info@mediaon.ma
                </a>
                <a
                  href="https://mediaon.ma/#contact"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-cta-ghost"
                >
                  <i className="bi bi-calendar-event me-1"></i> Demander un
                  rendez-vous découverte
                </a>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="small">
                <div className="fw-semibold mb-1">
                  <i className="bi bi-geo-alt me-1"></i> MediaON – Beni Mellal
                </div>
                <div>Hub wire, 3ème étage Asfet Serhani</div>
                <div>Bd 09 Décembre, Beni Mellal 23020</div>
                <div className="mt-2">
                  <i className="bi bi-telephone me-1"></i> 07 11 28 27 86
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function AboutMediaOn() {
  return (
    <div className="about-page">
      <Hero />
      <MissionSection />
      <ServicesSection />
      <ProcessSection />
      <ContactSection />
    </div>
  )
}

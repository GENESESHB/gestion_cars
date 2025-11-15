// MediaOnPage.jsx
import React from "react";
import { 
  FaLaptop, 
  FaChartLine, 
  FaInstagram, 
  FaWindows, 
  FaSearch, 
  FaBullseye, 
  FaShareAlt, 
  FaPalette,
  FaColumns, // Replaced FaKanban with FaColumns
  FaTachometerAlt,
  FaUsers,
  FaBullhorn,
  FaWhatsapp,
  FaMapMarkerAlt,
  FaInfinity,
  FaLayerGroup
} from "react-icons/fa";
import "./MediaOnPage.css"; // paste your CSS here

const MediaOnPage = () => {
  const openWhatsApp = () => {
    window.open("https://wa.me/212523421839", "_blank");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div>
          <p className="breadcrumb">
            Agence digitale & plateforme de gestion
          </p>
          <h1>
            MediaOn, votre <span className="highlight">partenaire digital</span>{" "}
            pour faire grandir votre business
          </h1>
          <p>
            MediaOn est une agence digitale spécialisée dans la création de
            sites web, le marketing digital, la gestion des réseaux sociaux, le
            SEO et la publicité en ligne. Nous aidons les entreprises à attirer
            plus de clients grâce à des solutions modernes, rapides et
            efficaces.
          </p>

          <div className="hero-features">
            <div className="feature-tag">
              <div
                className="feature-icon"
                style={{ background: "rgba(0, 102, 204, 0.1)" }}
              >
                <FaLaptop />
              </div>
              <span>Sites web professionnels</span>
            </div>
            <div className="feature-tag">
              <div
                className="feature-icon"
                style={{ background: "rgba(255, 122, 0, 0.1)" }}
              >
                <FaChartLine />
              </div>
              <span>SEO & visibilité Google</span>
            </div>
            <div className="feature-tag">
              <div
                className="feature-icon"
                style={{ background: "rgba(15, 155, 185, 0.1)" }}
              >
                <FaInstagram />
              </div>
              <span>Gestion réseaux sociaux</span>
            </div>
          </div>
        </div>

        <div className="devices">
          <img src="../assets/home.png" alt="medaion" />
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="fonctionnalites">
        <h2 className="section-title">Nos Services Digitaux</h2>
        <p className="section-subtitle">
          MediaOn vous accompagne dans toute votre stratégie digitale pour
          transformer vos visiteurs en clients.
        </p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-card-icon icon-blue">
              <FaWindows />
            </div>
            <h3>Création de Sites Web</h3>
            <p>
              Conception de sites vitrines et e-commerce modernes, rapides et
              responsives, optimisés pour la conversion.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon icon-teal">
              <FaSearch />
            </div>
            <h3>Référencement SEO</h3>
            <p>
              Améliorez votre visibilité sur Google, augmentez votre trafic
              qualifié et générez plus de demandes.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon icon-orange">
              <FaBullseye />
            </div>
            <h3>Publicité en Ligne</h3>
            <p>
              Campagnes ciblées sur Google, Facebook et Instagram pour attirer
              les bons clients au bon moment.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon icon-blue-soft">
              <FaShareAlt />
            </div>
            <h3>Gestion Réseaux Sociaux</h3>
            <p>
              Création de contenu, planning éditorial et gestion complète de vos
              comptes pour une image professionnelle.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon icon-orange-soft">
              <FaPalette />
            </div>
            <h3>Branding & Identité</h3>
            <p>
              Logos, chartes graphiques et univers de marque cohérent pour
              renforcer votre positionnement.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-icon icon-teal-soft">
              <FaColumns /> {/* Replaced FaKanban with FaColumns */}
            </div>
            <h3>MediaOn CRM</h3>
            <p>
              Suivez vos prospects, vos leads et vos clients dans un seul outil
              pensé pour les petites et moyennes entreprises.
            </p>
          </div>
        </div>
      </section>

      {/* Interface Section */}
      <section className="section interface-section" id="integrations">
        <h2 className="section-title">Une Interface Pensée pour Votre Business</h2>
        <p className="section-subtitle">
          Pilotez votre présence en ligne, vos leads et vos campagnes depuis un
          seul espace.
        </p>

        <div className="tabs">
          <button className="tab active">
            <FaTachometerAlt className="me-1" /> Tableau de bord
          </button>
          <button className="tab">
            <FaUsers className="me-1" /> Suivi des leads
          </button>
          <button className="tab">
            <FaBullhorn className="me-1" /> Campagnes &amp; SEO
          </button>
        </div>

        <div className="interface-content">
          <img
            src="https://i.pinimg.com/1200x/43/39/fa/4339fa6c8ca5568329bc54c464043118.jpg"
            alt="Dashboard MediaOn"
            className="interface-image"
          />

          <div>
            <h2>Tableau de Bord Global</h2>
            <p>
              Suivez en temps réel vos performances : visites du site, demandes
              de devis, leads générés, publications social media et résultats de
              vos campagnes publicitaires.
            </p>

            <ul className="interface-list">
              <li>Vue d'ensemble des performances digitales</li>
              <li>Suivi des leads et des conversions</li>
              <li>Rapports SEO et campagnes en quelques clics</li>
              <li>Export de rapports pour vos réunions &amp; clients</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="section why-section" id="avantages">
        <p className="tagline">Avantages MediaOn</p>
        <h2 className="section-title">Pourquoi travailler avec MediaOn ?</h2>
        <p className="section-subtitle">
          Nous combinons stratégie, créativité et données pour vous apporter des
          résultats concrets, pas seulement du trafic.
        </p>

        <div className="why-content">
          <img
            src="https://i.pinimg.com/736x/14/c1/8c/14c18c26374d456ad15c4d1a45d1f8a1.jpg"
            alt="Équipe MediaOn"
            className="interface-image"
          />

          <div>
            <div className="why-feature">
              <h3>
                <FaChartLine className="me-1 text-orange" /> Approche
                orientée résultats
              </h3>
              <p>
                Nous pensons en termes de leads, de ventes et de croissance, pas
                uniquement en nombre de likes ou de visites.
              </p>
            </div>

            <div className="why-feature">
              <h3>
                <FaLayerGroup className="me-1 text-blue" /> Stratégie 360°
              </h3>
              <p>
                Site web, SEO, réseaux sociaux, publicité et CRM : tout est
                connecté pour une stratégie cohérente.
              </p>
            </div>

            <div className="why-feature">
              <h3>
                <FaMapMarkerAlt className="me-1 text-teal" /> Équipe proche &amp;
                réactive
              </h3>
              <p>
                Basée à Beni Mellal, notre équipe reste disponible pour vous
                conseiller et adapter la stratégie à votre réalité.
              </p>
            </div>

            <div className="why-feature">
              <h3>
                <FaInfinity className="me-1 text-orange" /> Accompagnement
                long terme
              </h3>
              <p>
                Nous vous suivons après le lancement : optimisation continue,
                nouvelles idées, support et évolution de vos outils.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="logo" style={{ marginBottom: "20px" }}>
              <div className="logo-icon">M</div>
              <span className="logo-text">MediaOn</span>
            </div>
            <p className="footer-text">
              Agence digitale basée à Beni Mellal, spécialisée en création de
              sites web, SEO, réseaux sociaux et campagnes marketing
              performantes.
            </p>
          </div>

          <div className="footer-section">
            <h4>Navigation</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Accueil</a>
              </li>
              <li>
                <a href="#fonctionnalites">Services</a>
              </li>
              <li>
                <a href="#avantages">Avantages</a>
              </li>
              <li>
                <a href="#">MediaOn CRM</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Légal</h4>
            <ul className="footer-links">
              <li>
                <a href="#">CGU et Conditions</a>
              </li>
              <li>
                <a href="#">Politique de Confidentialité</a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <ul className="footer-links">
              <li>
                <a href="mailto:info@mediaon.ma">info@mediaon.ma</a>
              </li>
              <li>
                <a href="#">Support</a>
              </li>
              <li>
                <a href="#">Demander un devis</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 MediaOn. Tous droits réservés.</p>
          <p className="footer-bottom-links">
            <a href="#">Mentions légales</a> |{" "}
            <a href="#">Politique de cookies</a>
          </p>
        </div>
      </footer>

      {/* WhatsApp Float Button */}
      <div className="whatsapp-float" onClick={openWhatsApp}>
        <FaWhatsapp />
      </div>
    </>
  );
};

export default MediaOnPage;

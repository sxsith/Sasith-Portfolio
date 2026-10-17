import { useEffect, useRef, useState, useCallback } from 'react';
import pageMarkup from './page.html?raw';
import projectGroups from 'virtual:project-gallery';

const RUNTIME_SCRIPTS = [
  '/js/jquery-3.5.1.min.dc5e7f18c8.js',
  '/js/lando-offbrand.schunk.7321a5097fb66f41.js',
  '/js/lando-offbrand.751e0867.148dc658e77a3916.js',
  '/js/lando.OFF+BRAND.gold-android-fix-03.js',
];

const PROJECT_FRAME_PATH = 'M8 .5h390.89a7.5 7.5 0 0 1 7.5 7.5v356.983a7.5 7.5 0 0 1-7.5 7.5H263.329a23.502 23.502 0 0 0-18.375 8.849l-16.499 20.695a22.502 22.502 0 0 1-17.593 8.473H8A7.5 7.5 0 0 1 .5 403V8A7.5 7.5 0 0 1 8 .5Z';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-react-runtime="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.reactRuntime = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load runtime: ${src}`));

    if (src.endsWith('lando.OFF+BRAND.gold-android-fix-03.js')) {
      fetch(src)
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to load runtime: ${src}`);
          return response.text();
        })
        .then((source) => {
          const permanentHelmet = 'if (SHOW_HELMET_PERMANENTLY) {';
          const helmetWireframeAdd = 'this.settings.scene.add(this.wireframeMesh)';
          const helmetObjectSetup = 'this.instance.scale.set(6.9,6.9,7.1),';
          if (
            !source.includes(permanentHelmet) ||
            !source.includes(helmetWireframeAdd) ||
            !source.includes(helmetObjectSetup)
          ) {
            throw new Error('Could not find the hero helmet shader controls');
          }
          script.removeAttribute('src');
          script.textContent = source
            .replace(permanentHelmet, 'if (false) {')
            .replace(helmetObjectSetup, `${helmetObjectSetup}this.instance.visible=false,`)
            .replace(helmetWireframeAdd, 'this.wireframeMesh.visible = false');
          document.body.appendChild(script);
          resolve();
        })
        .catch(reject);
      return;
    }

    document.body.appendChild(script);
  });
}

export default function App() {
  const pageRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [formStatus, setFormStatus] = useState(null); // 'success' | 'error' | null

  const openModal = useCallback((e) => {
    e?.preventDefault();
    setFormStatus(null);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    document.body.style.overflow = '';
  }, []);

  const handleFormChange = useCallback((e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    const { name, email, subject, message } = formState;
    const mailtoLink = `mailto:sasithakalanka99@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Contact')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
    window.location.href = mailtoLink;
    setFormStatus('success');
    setTimeout(() => {
      closeModal();
      setFormState({ name: '', email: '', subject: '', message: '' });
      setFormStatus(null);
    }, 2000);
  }, [formState, closeModal]);

  useEffect(() => {
    let cancelled = false;
    let heroObserver;

    // The original page is mounted as-is. React owns the application shell,
    // while the original DOM/CSS/runtime are preserved to avoid visual changes.
    document.documentElement.classList.add('w-mod-js');

    const mount = async () => {
      if (!pageRef.current || cancelled) return;
      const template = document.createElement('template');
      template.innerHTML = pageMarkup;
      const pageContent = template.content;
      pageContent.querySelector('.nav-ham')?.remove();
      pageContent.querySelector('.nav-menu-w')?.remove();
      const servicesMarqueeText = 'WEB DEVELOPMENT , MOBILE APP DEVELOPMENT , UI/UX DESIGN , 3D DESIGN';

      const brandLink = pageContent.querySelector('[data-nav-group="brand"]');
      const brand = brandLink?.querySelector('.nav-brand');
      if (brand) {
        brand.innerHTML = `
          <svg class="portfolio-brand" viewBox="0 0 138 63" role="img" aria-label="Sasith Akalanka" xmlns="http://www.w3.org/2000/svg">
            <title>Sasith Akalanka</title>
            <text class="portfolio-brand-serif" x="69" y="28" text-anchor="middle">SASITH</text>
            <text class="portfolio-brand-sans" x="69" y="56" text-anchor="middle">AKALANKA</text>
          </svg>`;
      }
      if (brandLink) {
        brandLink.title = 'Sasith Akalanka Home';
        brandLink.setAttribute('aria-label', 'Sasith Akalanka Home');
      }

      const heroHomeLogo = pageContent.querySelector('.nav-middle .page-ln4-svg');
      if (heroHomeLogo) {
        heroHomeLogo.innerHTML = '<img class="sasith-home-mark" src="/images/sasith-nobg-logo.jpg" alt="" aria-hidden="true" />';
      }

      const contactButton = pageContent.querySelector('.btn-layout.is-nav a.btn-w');
      const contactLabel = contactButton?.querySelector('.btn-text');
      const footer = pageContent.querySelector('.s.is-footer');
      const footerImage = footer?.querySelector('.footer-bg-img');
      if (footerImage) {
        footerImage.src = '/images/sasith-front.jpg';
        footerImage.alt = 'Sasith Akalanka';
        footerImage.removeAttribute('srcset');
        footerImage.removeAttribute('sizes');
      }
      if (contactButton && contactLabel && footer) {
        contactLabel.textContent = 'Contact Me';
        contactButton.querySelector('.btn-icon-w')?.remove();
        contactButton.href = '#contact';
        contactButton.removeAttribute('target');
        footer.id = 'contact';
      }
      if (footer) {
        footer.querySelector('.footer-rive-w')?.remove();
        footer.querySelector('.footer-marquee')?.remove();

        for (const heading of footer.querySelectorAll('h2')) {
          if (/always bringing the fight/i.test(heading.textContent)) {
            heading.textContent = 'Always bringing the new ideas';
            heading.setAttribute('aria-label', 'Always bringing the new ideas');
          }
        }

        const footerContact = footer.querySelector('a.btn-w[href^="mailto:"]');
        const footerContactLabel = footerContact?.querySelector('.btn-text');
        if (footerContact && footerContactLabel) {
          footerContactLabel.textContent = 'Contact Me';
          const accessibleLabel = footerContact.querySelector('[screen-reader]');
          if (accessibleLabel) accessibleLabel.textContent = 'Contact Me';
          footerContact.href = '#contact';
          footerContact.removeAttribute('target');
          footerContact.setAttribute('aria-label', 'Contact Me');
        }

        const legalLinks = footer.querySelector('a[href*="/legal/"]');
        legalLinks?.closest('.footer-legal-links-col')?.remove();

        const copyright = footer.querySelector('.footer-legal-links-w .text-title-small-label.bold');
        if (copyright) copyright.textContent = `© ${new Date().getFullYear()} Sasith Akalanka.`;

        const footerPages = [...footer.querySelectorAll('.footer-links-col')].find((column) =>
          column.querySelector('.text-eyebrow')?.textContent.trim().toLowerCase() === 'pages'
        );
        const footerPageUpdates = [
          { from: '/on-track', to: '#development-projects', label: 'Development' },
          { from: '/off-track', to: '#design-projects', label: 'Design' },
          { from: '/partnerships', to: '#projects', label: 'Projects' },
          { from: '/calendar', to: '#contact', label: 'Contact' },
        ];
        for (const update of footerPageUpdates) {
          const link = footerPages?.querySelector(`.footer-links-layout a[href="${update.from}"]`);
          if (!link) continue;
          link.href = update.to;
          link.setAttribute('aria-label', update.label);
          const visibleLabel = link.querySelector('.btn-text');
          if (visibleLabel) visibleLabel.textContent = update.label;
          const accessibleLabel = link.querySelector('[screen-reader]');
          if (accessibleLabel) accessibleLabel.textContent = update.label;
        }
        footerPages?.querySelector('a[href^="https://store.landonorris.com/"]')?.remove();

        const followColumn = [...footer.querySelectorAll('.footer-links-col')].find((column) =>
          column.querySelector('.text-eyebrow')?.textContent.trim().toLowerCase() === 'follow on'
        );
        const socialLayout = followColumn?.querySelector('.footer-links-layout');
        if (socialLayout) {
          const profileLinks = [
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/sasith-akalanka' },
            { label: 'GitHub', href: 'https://github.com/sxsith' },
          ];
          const existingLinks = [...socialLayout.querySelectorAll('a')];

          for (const [index, profile] of profileLinks.entries()) {
            let link = existingLinks[index];
            if (!link) {
              link = document.createElement('a');
              link.className = 'text-link-w w-inline-block';
              const textClip = document.createElement('div');
              textClip.className = 'text-clip-w';
              const label = document.createElement('div');
              label.className = 'btn-text';
              textClip.append(label);
              link.append(textClip);
              socialLayout.append(link);
            }

            link.href = profile.href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', profile.label);
            const visibleLabel = link.querySelector('.btn-text');
            if (visibleLabel) visibleLabel.textContent = profile.label;
            else link.textContent = profile.label;
          }

          existingLinks.slice(profileLinks.length).forEach((link) => link.remove());
        }

        followColumn?.querySelector('a.is-hidden[href="#"]')?.remove();
      }

      pageContent.querySelector('.s.is-lando-exe')?.remove();
      pageContent.querySelector('.s.is-otot-end')?.remove();
      pageContent.querySelector('.home-hero-next-race-w')?.remove();
      pageContent.querySelectorAll('.eyebrow-w.hero-next-race').forEach((label) => label.remove());
      pageContent.querySelector('.marquee-adv-top-w')?.remove();
      pageContent.querySelector('.marquee-gl-target-w .marquee-gl-rive-w')?.remove();
      const marqueeSection = pageContent.querySelector('.s.home-marquee');
      const heroTrack = pageContent.querySelector('.sticky-track.home-hero');
      if (marqueeSection && heroTrack) heroTrack.after(marqueeSection);
      const carousel = pageContent.querySelector('.gl-carousel');
      if (carousel) {
        const marquee = document.createElement('div');
        marquee.className = 'services-marquee';

        const accessibleLabel = document.createElement('span');
        accessibleLabel.className = 'screen-reader';
        accessibleLabel.textContent = servicesMarqueeText;
        marquee.append(accessibleLabel);

        for (const lane of ['is-top', 'is-bottom']) {
          const row = document.createElement('div');
          row.className = `services-marquee-row ${lane}`;
          row.setAttribute('aria-hidden', 'true');

          for (let copy = 0; copy < 4; copy += 1) {
            const group = document.createElement('span');
            group.className = 'services-marquee-group';
            group.textContent = servicesMarqueeText;
            row.append(group);
          }

          marquee.append(row);
        }

        carousel.replaceChildren(marquee);
      }
      const introContent = pageContent.querySelector('.impact-content-w.is-home');
      if (introContent) {
        introContent.querySelector('.impact-icon-w')?.remove();

        const introStatement = introContent.querySelector('.text-impact-lg-mona');
        const bio = document.createElement('div');
        bio.className = 'portfolio-bio';
        const bioParagraphs = [
          {
            before: 'I’m ',
            accent: 'Sasith Akalanka',
            after: ', an ICT graduate and developer passionate about building modern digital experiences.',
          },
          {
            before: 'I work in ',
            accent: 'web and mobile development',
            after: ', UI/UX design, and 3D creation, turning ideas and real-world problems into practical digital solutions.',
          },
        ];

        const accessibleBio = document.createElement('p');
        accessibleBio.className = 'screen-reader';
        accessibleBio.textContent = bioParagraphs
          .map(({ before, accent, after }) => `${before}${accent}${after}`)
          .join(' ');
        bio.append(accessibleBio);

        for (const { before, accent, after } of bioParagraphs) {
          const paragraphGroup = document.createElement('div');
          paragraphGroup.className = 'portfolio-bio-paragraph';
          paragraphGroup.setAttribute('data-anim-high', 'right, lime-off');
          paragraphGroup.setAttribute('split-text', 'lines');
          paragraphGroup.setAttribute('aria-hidden', 'true');

          const paragraph = document.createElement('p');
          paragraph.append(before);

          const accentText = document.createElement('span');
          accentText.className = 'portfolio-bio-accent';
          accentText.textContent = accent;
          paragraph.append(accentText, after);

          paragraphGroup.append(paragraph);
          bio.append(paragraphGroup);
        }

        if (introStatement) introStatement.replaceWith(bio);
        else introContent.append(bio);
      }
      const projectsSection = pageContent.querySelector('.s-group.bg-black');
      if (projectsSection) {
        projectsSection.id = 'projects';
        const accessibleHeadings = projectsSection.querySelectorAll('.title-headline-w h2[screen-reader]');
        const visibleHeadings = projectsSection.querySelectorAll('.title-headline-w h2.text-title-lg-mona');
        if (accessibleHeadings[0]) accessibleHeadings[0].textContent = 'Projects';
        if (visibleHeadings[0]) {
          visibleHeadings[0].textContent = 'Projects';
          visibleHeadings[0].setAttribute('aria-label', 'Projects');
        }

        const projectDescription = 'A selection of projects across web and mobile development, UI/UX design, and 3D creation, built to solve real-world problems and deliver thoughtful digital experiences.';
        const accessibleDescription = projectsSection.querySelector('.title-para-w p[screen-reader]');
        const visibleDescription = projectsSection.querySelector('.title-para-w .text-body-reg-mona');
        if (accessibleDescription) accessibleDescription.textContent = projectDescription;
        if (visibleDescription) {
          visibleDescription.textContent = projectDescription;
          visibleDescription.setAttribute('aria-label', projectDescription);
        }

        const galleryMount = projectsSection.querySelector('[data-helmet-grid]')?.closest('.w-dyn-list');
        if (galleryMount) {
          const gallery = document.createElement('div');
          gallery.className = 'project-gallery';
          gallery.setAttribute('aria-label', 'Portfolio projects');

          for (const group of projectGroups) {
            const groupSection = document.createElement('section');
            groupSection.className = 'project-group';
            groupSection.id = group.id;

            const groupHeading = document.createElement('h3');
            groupHeading.className = 'project-group-title';
            groupHeading.textContent = group.name;
            groupSection.append(groupHeading);

            const projectGrid = document.createElement('div');
            projectGrid.className = 'project-grid';
            projectGrid.setAttribute('role', 'list');
            projectGrid.setAttribute('aria-label', `${group.name} projects`);

            for (const project of group.projects) {
              const card = document.createElement('article');
              card.className = 'project-card';
              card.setAttribute('role', 'listitem');

              const media = document.createElement('div');
              media.className = 'project-card-media';
              media.dataset.projectName = project.name;
              if (project.image) {
                const image = document.createElement('img');
                image.className = 'project-card-image';
                image.src = project.image;
                image.alt = project.name;
                image.loading = 'lazy';
                image.decoding = 'async';
                media.append(image);
              }

              if (project.video) {
                const video = document.createElement('video');
                video.className = 'project-card-video';
                video.src = project.video;
                video.muted = true;
                video.setAttribute('muted', '');
                video.loop = true;
                video.playsInline = true;
                video.preload = 'metadata';
                video.setAttribute('aria-label', `${project.name} video preview`);

                if (project.image) {
                  media.tabIndex = 0;
                } else {
                  video.classList.add('is-always-visible');
                  video.autoplay = true;
                }

                media.append(video);
              }

              const outline = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              outline.classList.add('project-card-outline');
              outline.setAttribute('viewBox', '0 0 407 411');
              outline.setAttribute('preserveAspectRatio', 'none');
              outline.setAttribute('aria-hidden', 'true');

              const outlinePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              outlinePath.setAttribute('d', PROJECT_FRAME_PATH);
              outlinePath.setAttribute('fill', 'none');
              outlinePath.setAttribute('stroke', 'currentColor');
              outlinePath.setAttribute('stroke-width', '2');
              outlinePath.setAttribute('vector-effect', 'non-scaling-stroke');
              outline.append(outlinePath);

              const title = document.createElement('h4');
              title.className = 'project-card-title';
              title.textContent = project.name;

              media.append(outline);
              card.append(media, title);
              projectGrid.append(card);
            }

            groupSection.append(projectGrid);
            gallery.append(groupSection);
          }

          galleryMount.replaceWith(gallery);
        }

        const calloutText = 'See selected projects and highlights from my work.';
        const accessibleCallout = projectsSection.querySelector('.callout-text-w [screen-reader]');
        const visibleCallout = projectsSection.querySelector('.callout-text-w .text-cta-short-intro');
        if (accessibleCallout) accessibleCallout.textContent = calloutText;
        if (visibleCallout) {
          visibleCallout.textContent = calloutText;
          visibleCallout.setAttribute('aria-label', calloutText);
        }
        projectsSection.querySelector('.c.is-callout')?.remove();
      }
      pageContent.querySelector('.s.is-home-collabs')?.remove();
      pageContent.querySelector('.s.is-callout-socials')?.remove();
      pageContent.querySelector('.s.is-horizontal-track')?.remove();
      const onOffTrack = pageContent.querySelector('.sticky-track.is-home-otot');
      if (onOffTrack) {
        onOffTrack.setAttribute('data-gl-change-from', 'dark-green, dark-green-tint-1');
        onOffTrack.setAttribute('data-gl-change-to', 'white, dark-green-tint-1-low');
        onOffTrack.setAttribute('data-gl-change-trigger-start', 'top bottom');
        onOffTrack.setAttribute('data-gl-change-trigger-end', 'bottom bottom');
        onOffTrack.setAttribute('data-gl-change-track', '');
        const developmentLink = onOffTrack.querySelector('a[href="/on-track"]');
        if (developmentLink) {
          developmentLink.href = '#development-projects';
          developmentLink.title = 'View development projects';
          developmentLink.setAttribute('aria-label', 'View development projects');
        }
        const designLink = onOffTrack.querySelector('a[href="/off-track"]');
        if (designLink) {
          designLink.href = '#design-projects';
          designLink.title = 'View design projects';
          designLink.setAttribute('aria-label', 'View design projects');
        }
      }

      const onTrackDescription = pageContent.querySelector('.otot-home-p-w:not(.is-2) p');
      if (onTrackDescription) {
        const projectType = document.createElement('strong');
        projectType.textContent = 'Development projects';
        onTrackDescription.replaceChildren(projectType, ' in web and mobile.');
        onTrackDescription.setAttribute('aria-label', 'Development projects in web and mobile.');
      }

      const offTrackDescription = pageContent.querySelector('.otot-home-p-w.is-2 p');
      if (offTrackDescription) {
        const projectType = document.createElement('strong');
        projectType.textContent = 'Design projects';
        offTrackDescription.replaceChildren(projectType, ' in UI/UX and visual design.');
        offTrackDescription.setAttribute('aria-label', 'Design projects in UI/UX and visual design.');
      }

      const pageHeading = pageContent.querySelector('.home-title-w h1');
      if (pageHeading) pageHeading.textContent = 'Sasith Akalanka';
      const pageSubheading = pageContent.querySelector('.home-title-w h2');
      if (pageSubheading) pageSubheading.textContent = 'Developer and digital experience creator';

      const customPortraits = {
        hero: '/images/sasith-frontbg-atlas.jpg?v=2',
        heroAnime: '/images/sasith-anime-atlas.jpg?v=2',
        onTrack: '/images/sasith-left.jpg',
        offTrack: '/images/sasith-right.jpg',
      };

      const onTrackImage = pageContent.querySelector('.otot-home-img-w.is-1 .otot-home-img');
      if (onTrackImage) {
        onTrackImage.src = customPortraits.onTrack;
        onTrackImage.alt = 'Sasith Akalanka on track portrait';
        onTrackImage.removeAttribute('srcset');
      }

      const offTrackImage = pageContent.querySelector('.otot-home-img-w.is-2 .otot-home-img');
      if (offTrackImage) {
        offTrackImage.src = customPortraits.offTrack;
        offTrackImage.alt = 'Sasith Akalanka off track portrait';
        offTrackImage.removeAttribute('srcset');
      }

      const heroSection = pageContent.querySelector('.sticky-track.home-hero .c.home-hero');
      if (heroSection) {
        heroSection.querySelector('.home-hero-tablet-hero-text')?.remove();
      }

      pageContent.querySelectorAll('.text-eyebrow').forEach((element) => {
        if (/mclaren|lando/i.test(element.textContent)) element.remove();
      });

      pageRef.current.replaceChildren(pageContent.cloneNode(true));

      const homeLink = pageRef.current.querySelector('.nav-middle');
      const mountedHeroTrack = pageRef.current.querySelector('.sticky-track.home-hero');
      if (homeLink && mountedHeroTrack) {
        heroObserver = new IntersectionObserver(([entry]) => {
          const hasPassedHero = entry.boundingClientRect.bottom <= 0;
          homeLink.classList.toggle('is-past-home-hero', hasPassedHero);
        });
        heroObserver.observe(mountedHeroTrack);
      }

      // Original end-of-body runtime, kept in its original local form.
      for (const src of RUNTIME_SCRIPTS.slice(0, -1)) {
        try {
          await loadScript(src);
        } catch (error) {
          console.warn(error);
        }
      }
      try {
        await loadScript(RUNTIME_SCRIPTS[RUNTIME_SCRIPTS.length - 1]);
      } catch (error) {
        console.warn(error);
      }

      const projectGallery = pageRef.current.querySelector('.project-gallery');
      if (projectGallery) {
        const setVideoPreview = (media, isActive) => {
          const video = media.querySelector('.project-card-video:not(.is-always-visible)');
          if (!video) return;

          media.classList.toggle('is-video-active', isActive);
          if (isActive) {
            video.play().catch((error) => {
              console.error(`Unable to play the video preview for ${media.dataset.projectName}.`, error);
            });
          } else {
            video.pause();
            video.currentTime = 0;
          }
        };
        const getProjectMedia = (target) => {
          const media = target?.closest?.('.project-card-media');
          return media && projectGallery.contains(media) ? media : null;
        };

        projectGallery.addEventListener('pointerover', (event) => {
          const media = getProjectMedia(event.target);
          if (media && !media.contains(event.relatedTarget)) setVideoPreview(media, true);
        });
        projectGallery.addEventListener('pointerout', (event) => {
          const media = getProjectMedia(event.target);
          if (media && !media.contains(event.relatedTarget)) setVideoPreview(media, false);
        });
        projectGallery.addEventListener('focusin', (event) => {
          const media = getProjectMedia(event.target);
          if (media) setVideoPreview(media, true);
        });
        projectGallery.addEventListener('focusout', (event) => {
          const media = getProjectMedia(event.target);
          if (media && !media.contains(event.relatedTarget)) setVideoPreview(media, false);
        });
      }

      const headTextures = window.landoGL?.assets?.textures?.head;
      const isDesktop = window.innerWidth > 991;
      if (headTextures) {
        const portraitTexture = isDesktop
          ? customPortraits.hero
          : '/gl/textures/head/ktx2/sasith-frontbg-atlas.ktx2?v=3';
        headTextures.diffuse = portraitTexture;
        headTextures.alpha = isDesktop
          ? '/gl/textures/head/webp/sasith-frontbg-alpha.png'
          : '/gl/textures/head/ktx2/sasith-frontbg-alpha.ktx2';
        headTextures.depth = isDesktop
          ? '/gl/textures/head/webp/sasith-frontbg-depth.png'
          : '/gl/textures/head/ktx2/sasith-frontbg-depth.ktx2';
        for (const shadowTexture of Object.keys(headTextures.shadow ?? {})) {
          headTextures.shadow[shadowTexture] = shadowTexture === 'softerEdit'
            ? customPortraits.heroAnime
            : portraitTexture;
        }
      }

      const helmetTextures = window.landoGL?.assets?.textures?.helmet;
      const helmetLiveryTexture = isDesktop
        ? '/gl/textures/helmet/webp/sasith-helmet-livery.png'
        : '/gl/textures/helmet/ktx2/sasith-helmet-livery.ktx2';
      if (helmetTextures) {
        for (const textureName of ['diffuseLime', 'diffuseDark', 'diffuseGrid', 'diffuseDisco', 'diffuseGoogle']) {
          if (textureName in helmetTextures) helmetTextures[textureName] = helmetLiveryTexture;
        }
      }

      const glassTextures = window.landoGL?.assets?.textures?.glass;
      if (glassTextures) {
        glassTextures.base = isDesktop
          ? '/gl/textures/helmet/webp/sasith-visor-tint.png'
          : '/gl/textures/helmet/ktx2/sasith-visor-tint.ktx2';
      }

      const headScene = window.landoGL?.params?.headScene;
      if (headScene) headScene.CURSOR_INTENSITY = 1;

      const carouselScene = window.landoGL?.params?.carouselScene;
      if (carouselScene) {
        carouselScene.TEXT_TOP = servicesMarqueeText;
        carouselScene.TEXT_BOTTOM = servicesMarqueeText;
      }

      // Original transition curtain fallback.
      const curtain = document.querySelector('.transition-w');
      if (curtain) {
        window.setTimeout(() => {
          curtain.style.pointerEvents = 'none';
          curtain.style.opacity = '0';
          curtain.style.transition = 'opacity 0.8s ease';
          window.setTimeout(() => {
            curtain.style.display = 'none';
          }, 800);
        }, 2500);
      }

      // Wire all contact-me footer buttons to open the modal.
      if (!cancelled) {
        const wireContactButtons = () => {
          const buttons = pageRef.current?.querySelectorAll(
            'a[href="#contact"], a.btn-w[aria-label="Contact Me"]'
          );
          buttons?.forEach((btn) => {
            btn.addEventListener('click', openModal);
          });
        };
        wireContactButtons();
      }

      if (!cancelled) setLoading(false);

      // Some original code listens for DOMContentLoaded. Give it a safe
      // synthetic signal after the DOM/runtime have been restored.
      if (!cancelled) {
        document.dispatchEvent(new Event('DOMContentLoaded'));
      }
    };

    mount();

    return () => {
      cancelled = true;
      heroObserver?.disconnect();
    };
  }, []);

  return (
    <>
      {/* ── Loading Screen ── */}
      {loading && (
        <div id="portfolio-loading-screen" role="status" aria-label="Loading Sasith Akalanka portfolio">
          <span className="loading-title" aria-hidden="true">Load Sasith</span>
        </div>
      )}

      {/* ── Page Root ── */}
      <div id="legacy-page-root" ref={pageRef} />

      {/* ── Contact Modal ── */}
      {showModal && (
        <div
          id="contact-modal-overlay"
          className="contact-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="contact-modal">
            <button
              className="contact-modal-close"
              onClick={closeModal}
              aria-label="Close contact form"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="contact-modal-header">
              <div className="contact-modal-eyebrow">Get In Touch</div>
              <h2 id="contact-modal-title" className="contact-modal-title">Contact Me</h2>
              <p className="contact-modal-subtitle">Have a project in mind or just want to say hello? I&rsquo;d love to hear from you.</p>
            </div>

            {formStatus === 'success' ? (
              <div className="contact-modal-success" role="alert">
                <div className="contact-success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p>Your message is on its way!</p>
                <span>Opening your email client&hellip;</span>
              </div>
            ) : (
              <form
                id="contact-form"
                className="contact-form"
                onSubmit={handleFormSubmit}
                noValidate
              >
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label htmlFor="contact-name" className="contact-label">Full Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="contact-input"
                      value={formState.name}
                      onChange={handleFormChange}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="contact-email" className="contact-label">Email Address</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="contact-input"
                      value={formState.email}
                      onChange={handleFormChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-subject" className="contact-label">Subject</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    className="contact-input"
                    value={formState.subject}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-message" className="contact-label">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="contact-input contact-textarea"
                    rows={5}
                    value={formState.message}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="contact-form-footer">
                  <span className="contact-recipient">✉ sasithakalanka99@gmail.com</span>
                  <button id="contact-submit" type="submit" className="contact-submit">
                    <span>Send Message</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

import React, { useState } from 'react';
import { getGalleryImages, getLabFacilities } from '../data/airlabData';
import type { GalleryImageRecord } from '../data/airlabData';

export default function Gallery() {
  const images = getGalleryImages();
  const facilities = getLabFacilities();
  const [selectedImage, setSelectedImage] = useState<GalleryImageRecord | null>(null);

  return (
    <>
      {/* STUDIO UNLMTD GALLERY MASTHEAD */}
      <section className="section portfolio-heading">
        <div className="section-label reveal is-visible">
          <span>VISUAL ARCHIVE</span>
          <span>NED UNIVERSITY · DEPARTMENT OF CSIT</span>
        </div>
        <h1 className="reveal is-visible" data-fit="">
          Lab.
        </h1>
        <p className="reveal is-visible">
          Inside our deep learning GPU clusters, research workstations, and autonomous robotics
          testbeds at NED University Main Campus.
        </p>
      </section>

      {/* STUDIO UNLMTD PORTFOLIO GRID FOR GALLERY PLATES */}
      <section className="section portfolio-index" aria-label="Laboratory Photographs">
        <div className="portfolio-grid">
          {images.map((img, idx) => (
            <a
              key={img.id}
              href={`#photo-${img.id}`}
              className="project-link reveal is-visible"
              onClick={(e) => {
                e.preventDefault();
                setSelectedImage(img);
              }}
            >
              <div
                className="project-visual no-blend"
                style={
                  {
                    background: idx % 2 === 0 ? '#0b0c0e' : '#e9eeed',
                    color: idx % 2 === 0 ? '#ffffff' : '#0b0c0e',
                  } as React.CSSProperties
                }
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  width="1200"
                  height="900"
                  loading={idx < 2 ? 'eager' : 'lazy'}
                />
                <div className="visual-bottom" aria-hidden="true">
                  <span>{img.category.toUpperCase()}</span>
                </div>
              </div>
              <div className="project-caption">
                <h3>{img.category}</h3>
                <span>{img.date || 'NED CSIT'}</span>
                <span className="project-kind">{img.caption}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* HARDWARE & LABORATORY SPECIFICATIONS */}
      <section className="section studio-dark">
        <div className="section-label reveal is-visible">
          <span>COMPUTE &amp; HARDWARE SPECIFICATIONS</span>
          <span>4 CORE LABORATORY UNITS</span>
        </div>
        <div className="editorial-three" style={{ marginTop: '45px' }}>
          {facilities.map((fac, idx) => (
            <article key={fac.code} className="reveal is-visible">
              <span>
                {String(idx + 1).padStart(2, '0')} · {fac.metrics}
              </span>
              <h3>{fac.unit}</h3>
              <p>
                <strong>{fac.spec}:</strong> {fac.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* LIGHTBOX DIALOG (STUDIO UNLMTD .project-gallery) */}
      {selectedImage && (
        <dialog
          open
          className="project-gallery"
          aria-label="Image viewer"
          onClick={() => setSelectedImage(null)}
        >
          <div className="gallery-toolbar" onClick={(e) => e.stopPropagation()}>
            <span className="gallery-count">{selectedImage.category.toUpperCase()}</span>
            <button type="button" onClick={() => setSelectedImage(null)}>
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <figure onClick={(e) => e.stopPropagation()}>
            <div className="gallery-stage">
              <img src={selectedImage.src} alt={selectedImage.caption} />
            </div>
            <figcaption>{selectedImage.caption}</figcaption>
          </figure>
          <div className="gallery-controls" onClick={(e) => e.stopPropagation()}>
            <span>{selectedImage.date || 'NED University CSIT'}</span>
            <button type="button" onClick={() => setSelectedImage(null)}>
              Return to archive
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}

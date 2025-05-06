document.addEventListener('DOMContentLoaded', function () {
    const elements = {
        dots: document.querySelectorAll('.product-dot'),
        popup: document.getElementById('product-popup'),
        closeBtn: document.querySelector('.popup-close'),
        mainCarouselItems: document.querySelectorAll('.carousel-item'),
        popupCarouselTrack: document.querySelector('.popup-carousel-track'),
        popupCarouselDots: document.querySelector('.popup-carousel-dots'),
        carouselTrack: document.querySelector('.carousel-track'),
        carouselWrapper: document.querySelector('.carousel-wrapper'),
        colorButtons: document.querySelectorAll('.color-btn'),
        previewImage: document.getElementById('color-preview-image'),
        waveLayer: document.getElementById('wave-layer')
    };
    const state = {
        isDown: false,
        startX: 0,
        scrollLeft: 0,
        waveTime: 0
    };
    const popupManager = {
        currentSlide: 0,
        touchStartX: 0,
        touchEndX: 0,
        minSwipeDistance: 50,
        isDragging: false,
        currentTranslate: 0,
        mouseStartX: 0,
        autoSlideInterval: null,
        isTransitioning: false,
        startAutoSlide() {
            if (this.autoSlideInterval) {
                clearInterval(this.autoSlideInterval);
            }
            this.autoSlideInterval = setInterval(() => {
                if (!this.isTransitioning) {
                    const totalSlides = elements.popupCarouselTrack.children.length;
                    const nextSlide = (this.currentSlide + 1) % totalSlides;
                    elements.popupCarouselTrack.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                    this.slideToImage(nextSlide);
                }
            }, 3000);
        },
        stopAutoSlide() {
            if (this.autoSlideInterval) {
                clearInterval(this.autoSlideInterval);
                this.autoSlideInterval = null;
            }
        },
        open(content = {}) {
            elements.popup.style.display = 'block';
            document.body.style.overflow = 'hidden';
            if (content.title) {
                elements.popup.querySelector('.popup-header h2').textContent = content.title;
            }
            if (content.description) {
                elements.popup.querySelector('.popup-body p').textContent = content.description;
            }
        },
        close() {
            this.stopAutoSlide();
            elements.popup.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.currentSlide = 0;
            if (elements.popupCarouselTrack) {
                elements.popupCarouselTrack.innerHTML = '';
            }
            if (elements.popupCarouselDots) {
                elements.popupCarouselDots.innerHTML = '';
            }
        },
        initTouchEvents() {
            if (elements.popupCarouselTrack) {
                elements.popupCarouselTrack.addEventListener('touchstart', (e) => {
                    if (!this.isTransitioning) {
                        this.stopAutoSlide();
                        this.handleStart(e.touches[0].clientX);
                    }
                }, {
                    passive: false
                });
                elements.popupCarouselTrack.addEventListener('touchmove', (e) => {
                    if (!this.isTransitioning) {
                        this.handleMove(e, e.touches[0].clientX);
                    }
                }, {
                    passive: false
                });
                elements.popupCarouselTrack.addEventListener('touchend', (e) => {
                    if (!this.isTransitioning) {
                        this.handleEnd(e.changedTouches[0].clientX);
                        this.startAutoSlide();
                    }
                });
                elements.popupCarouselTrack.addEventListener('mousedown', (e) => {
                    if (!this.isTransitioning) {
                        e.preventDefault();
                        this.stopAutoSlide();
                        this.handleStart(e.clientX);
                    }
                });
                elements.popupCarouselTrack.addEventListener('mousemove', (e) => {
                    if (!this.isTransitioning) {
                        this.handleMove(e, e.clientX);
                    }
                });
                elements.popupCarouselTrack.addEventListener('mouseup', (e) => {
                    if (!this.isTransitioning) {
                        this.handleEnd(e.clientX);
                        this.startAutoSlide();
                    }
                });
                elements.popupCarouselTrack.addEventListener('mouseleave', (e) => {
                    if (this.isDragging && !this.isTransitioning) {
                        this.handleEnd(e.clientX);
                        this.startAutoSlide();
                    }
                });
                elements.popupCarouselTrack.addEventListener('transitionend', () => {
                    this.isTransitioning = false;
                    elements.popupCarouselTrack.style.transition = 'transform 0.3s ease';
                });
            }
        },
        handleStart(clientX) {
            this.isDragging = true;
            this.touchStartX = clientX;
            this.currentTranslate = -this.currentSlide * 100;
            elements.popupCarouselTrack.style.transition = 'none';
            elements.popupCarouselTrack.style.cursor = 'grabbing';
        },
        handleMove(e, clientX) {
            if (!this.isDragging) return;
            e.preventDefault();
            const diff = ((clientX - this.touchStartX) / elements.popupCarouselTrack.offsetWidth) * 100;
            const transform = this.currentTranslate + diff;
            elements.popupCarouselTrack.style.transform = `translateX(${transform}%)`;
        },
        handleEnd(clientX) {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.touchEndX = clientX;
            elements.popupCarouselTrack.style.transition = 'transform 0.3s ease';
            elements.popupCarouselTrack.style.cursor = 'grab';
            this.handleSwipe();
        },
        handleSwipe() {
            const swipeDistance = this.touchEndX - this.touchStartX;
            const totalSlides = elements.popupCarouselTrack.children.length;
            const threshold = elements.popupCarouselTrack.offsetWidth * 0.2;
            if (Math.abs(swipeDistance) >= threshold) {
                if (swipeDistance > 0 && this.currentSlide > 0) {
                    this.slideToImage(this.currentSlide - 1);
                } else if (swipeDistance < 0 && this.currentSlide < totalSlides - 1) {
                    this.slideToImage(this.currentSlide + 1);
                } else {
                    this.slideToImage(this.currentSlide);
                }
            } else {
                this.slideToImage(this.currentSlide);
            }
        },
        updateCarousel(item) {
            try {
                if (!elements.popupCarouselTrack || !elements.popupCarouselDots) {
                    console.error('Carousel elements not found:', {
                        track: elements.popupCarouselTrack,
                        dots: elements.popupCarouselDots
                    });
                    return;
                }
                elements.popupCarouselTrack.innerHTML = '';
                elements.popupCarouselDots.innerHTML = '';
                let images = [];
                try {
                    if (item.dataset.images) {
                        images = JSON.parse(item.dataset.images);
                    } else if (item.dataset.image) {
                        images = [item.dataset.image];
                    } else {
                        images = [item.querySelector('img').src];
                    }
                } catch (parseError) {
                    console.error('Error parsing images data:', parseError);
                    images = [item.querySelector('img').src];
                }
                images.forEach((imgSrc, index) => {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'popup-carousel-slide';
                    const newImg = document.createElement('img');
                    newImg.src = imgSrc;
                    newImg.alt = `Product View ${index + 1}`;
                    imgContainer.appendChild(newImg);
                    elements.popupCarouselTrack.appendChild(imgContainer);
                    const dot = document.createElement('button');
                    dot.className = `popup-carousel-dot ${index === 0 ? 'active' : ''}`;
                    dot.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Only proceed if dot is not active and not transitioning
                        if (!this.isTransitioning && !dot.classList.contains('active')) {
                            this.stopAutoSlide();
                            const dots = elements.popupCarouselDots.querySelectorAll('.popup-carousel-dot');
                            dots.forEach(d => d.classList.remove('active'));
                            dot.classList.add('active');
                            elements.popupCarouselTrack.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                            this.slideToImage(index);
                            this.startAutoSlide();
                        }
                    });
                    elements.popupCarouselDots.appendChild(dot);
                });
                this.currentSlide = 0;
                this.updateSlidePosition();
                this.initTouchEvents();
                this.startAutoSlide();
            } catch (error) {
                console.error('Error updating carousel:', error);
            }
        },
        slideToImage(index) {
            this.isTransitioning = true;
            this.currentSlide = index;
            const slides = elements.popupCarouselTrack.querySelectorAll('.popup-carousel-slide');
            slides.forEach((slide, i) => {
                slide.style.opacity = i === index ? '1' : '0.5';
                slide.style.transition = 'opacity 0.5s ease';
            });
            this.updateSlidePosition();
            this.updateDots();
        },
        updateSlidePosition() {
            if (elements.popupCarouselTrack) {
                elements.popupCarouselTrack.style.transform = `translateX(-${this.currentSlide * 100}%)`;
            }
        },
        updateDots() {
            if (elements.popupCarouselDots) {
                const dots = elements.popupCarouselDots.querySelectorAll('.popup-carousel-dot');
                dots.forEach((dot, i) => {
                    dot.classList.toggle('active', i === this.currentSlide);
                });
            }
        }
    };
    const colorManager = {
        colorMap: {
            'Dark': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/dpg.png'
            },
            'Charcoal Grey': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/05/02-AcoustIQ-Swatch-Charcoal-Grey.png'
            },
            'Grey': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/05/03-AcoustIQ-Swatch-Grey.png'
            },
            'Pacific Marble': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/05/04-AcoustIQ-Swatch-Pacific-Marble.png'
            },
            'Slate Grey': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/05/05-AcoustIQ-Swatch-Slate-Grey.png'
            },
            'Marble Grey': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-mg.png'
            },
            'White': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-w.png'
            },
            'Light Merlot': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-lm.png'
            },
            'Light Beige': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-lb.png'
            },
            'Natural': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-n.png'
            },
            'Dark Beige': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-db-1.png'
            },
            'Mid Natural': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-mn.png'
            },
            'Dark Natural': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dn.png'
            },
            'Brown': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-br.png'
            },
            'Moss Banana Green': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-mbg.png'
            },
            'Banana Green': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-bg.png'
            },
            'Golden Yellow': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-gy.png'
            },
            'Yellow': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-y.png'
            },
            'Orange': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-or.png'
            },
            'Red': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-r.png'
            },
            'Burnt Orange': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-bo.png'
            },
            'Coral Pink': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-cp.png'
            },
            'Acoustic Pink': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-pi.png'
            },
            'Merlot': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-ml.png'
            },
            'Dark Red': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dr.png'
            },
            'Maroon': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-mr.png'
            },
            'Dark Maroon': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dm.png'
            },
            'Royal Pink': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-rp.png'
            },
            'Purple': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-pr.png'
            },
            'Dark Purple': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-drl.png'
            },
            'Dark Merlot': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dmt.png'
            },
            'Dark Blue': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dbe.png'
            },
            'Indigo Blue': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-ib.png'
            },
            'Blue': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-ble.png'
            },
            'Cobalt Blue': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-cbe.png'
            },
            'Pacific Blue': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-pbe.png'
            },
            'Light Fern': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-lfn.png'
            },
            'Sky Blue': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-ske.png'
            },
            'Fern': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-fer.png'
            },
            'Green': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-grn.png'
            },
            'Dark Green': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dgn.png'
            },
            'Peacock Green': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-pgn.png'
            },
            'Dark Peacock Green': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dpg.png'
            },
            'Dark Fern': {
                mockup: 'https://olgoffice.com/wp-content/uploads/2025/04/aq-dfn.png'
            }
        },
        updatePreview(colorName) {
            const colorData = this.colorMap[colorName];
            if (!colorData) return;
            const previewImage = document.querySelector('.color-preview img');
            if (previewImage) {
                previewImage.src = colorData.mockup;
                previewImage.alt = `${colorName} Preview`;
            }
        },
        initColorButtons() {
            const colorButtons = document.querySelectorAll('.color-btn');
            colorButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    colorButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const colorName = btn.dataset.label;
                    this.updatePreview(colorName);
                });
            });
        }
    };
    const animationManager = {
        initPulseAnimation() {
            const style = document.createElement('style');
            style.textContent = `
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(7, 180, 208, 0.7); }
                    70% { transform: scale(1.2); box-shadow: 0 0 0 10px rgba(7, 180, 208, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(7, 180, 208, 0); }
                }
            `;
            document.head.appendChild(style);
        },
    };
    function initializeEventListeners() {
        elements.dots.forEach(dot => {
            dot.style.animation = 'pulse 2s infinite';
            dot.addEventListener('click', e => {
                e.preventDefault();
                popupManager.open({
                    title: dot.dataset.product,
                    description: `Learn more about our ${dot.dataset.product.toLowerCase()} solutions.`
                });
            });
        });
        elements.mainCarouselItems.forEach((item) => {
            item.addEventListener('click', () => {
                const title = item.querySelector('.pc-content-title').innerHTML;
                const paragraphs = item.querySelectorAll('.pc-content-text');
                // Update popup content
                elements.popup.querySelector('.popup-header h2').innerHTML = title;
                const popupBody = elements.popup.querySelector('.popup-body');
                popupBody.innerHTML = '';
                // Add paragraphs with proper styling
                paragraphs.forEach((p, index) => {
                    const newP = document.createElement('p');
                    newP.innerHTML = p.innerHTML;
                    if (index === 0) {
                        newP.style.color = '#07B4D0';
                        newP.style.fontWeight = '500';
                        newP.style.marginBottom = '15px';
                    }
                    popupBody.appendChild(newP);
                });
                popupManager.open();
                setTimeout(() => {
                    popupManager.updateCarousel(item);
                }, 100);
            });
        });
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', () => popupManager.close());
        }
        if (elements.popup) {
            elements.popup.addEventListener('click', e => {
                if (e.target === elements.popup) popupManager.close();
            });
        }
        let isDragging = false;
        let startPosition = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        if (elements.carouselWrapper && elements.carouselTrack) {
            const handleDragStart = (e) => {
                isDragging = true;
                startPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
                elements.carouselWrapper.style.cursor = 'grabbing';
                elements.carouselTrack.style.transition = 'none';
            };
            const handleDrag = (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const currentPosition = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
                const diff = currentPosition - startPosition;
                currentTranslate = prevTranslate + diff;
                elements.carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
            };
            const handleDragEnd = () => {
                isDragging = false;
                elements.carouselWrapper.style.cursor = 'grab';
                elements.carouselTrack.style.transition = 'transform 0.5s ease';
                const carouselWidth = elements.carouselWrapper.offsetWidth;
                const trackWidth = elements.carouselTrack.scrollWidth;
                const lastItemWidth = elements.carouselTrack.lastElementChild.offsetWidth;
                const minTranslate = -(trackWidth - carouselWidth);
                const lastItemVisibleWidth = carouselWidth - (Math.abs(currentTranslate) + trackWidth - lastItemWidth);
                const visibilityThreshold = lastItemWidth * 0.15;
                const overflowAllowance = lastItemWidth * 1.5;
                if (lastItemVisibleWidth < visibilityThreshold && currentTranslate < minTranslate - overflowAllowance) {
                    currentTranslate = 0;
                    elements.carouselTrack.style.transition = 'transform 0.8s ease-out';
                } else if (currentTranslate > 0) {
                    currentTranslate = 0;
                } else if (currentTranslate < minTranslate - overflowAllowance) {
                    currentTranslate = minTranslate - overflowAllowance;
                }
                prevTranslate = currentTranslate;
                elements.carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
            };
            elements.carouselWrapper.addEventListener('mousedown', handleDragStart);
            elements.carouselWrapper.addEventListener('touchstart', handleDragStart);
            elements.carouselWrapper.addEventListener('mousemove', handleDrag);
            elements.carouselWrapper.addEventListener('touchmove', handleDrag);
            elements.carouselWrapper.addEventListener('mouseup', handleDragEnd);
            elements.carouselWrapper.addEventListener('touchend', handleDragEnd);
            elements.carouselWrapper.addEventListener('mouseleave', handleDragEnd);
        }
        elements.colorButtons.forEach(button => {
            button.addEventListener('click', function () {
                elements.colorButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const color = this.dataset.color;
                const label = this.dataset.label;
                colorManager.updatePreview(color, label);
            });
        });
    }
    function initialize() {
        animationManager.initPulseAnimation();
        initializeEventListeners();
        colorManager.initColorButtons();
    }
    initialize();
});
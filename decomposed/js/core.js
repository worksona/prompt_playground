// Make core utilities available globally
window.APP_CORE = {
    FileProcessor: {
        // Your file processor methods
    },
    utils: {
        // Your utility methods
    }
};

// VoronoiBackground Component
const VoronoiBackground = () => {
    React.useEffect(() => {
        const canvas = document.getElementById('voronoi-canvas');
        const context = canvas.getContext('2d');
        const numPoints = 100;
        const points = [];
        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId;

        class Point {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
        }

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        function initPoints() {
            points.length = 0;
            for (let i = 0; i < numPoints; i++) {
                points.push(new Point());
            }
        }

        function drawVoronoi() {
            context.clearRect(0, 0, width, height);
            points.forEach(point => point.update());
            
            const delaunay = d3.Delaunay.from(points.map(p => [p.x, p.y]));
            const voronoi = delaunay.voronoi([0, 0, width, height]);

            context.beginPath();
            context.strokeStyle = "rgba(90, 125, 154, 0.2)";
            voronoi.render(context);
            context.stroke();
        }

        function animate() {
            drawVoronoi();
            animationFrameId = requestAnimationFrame(animate);
        }

        resizeCanvas();
        initPoints();
        window.addEventListener('resize', () => {
            resizeCanvas();
            initPoints();
        });
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return null;
};

// Utility Components
const CopyButton = ({ text }) => {
    const [copied, setCopied] = React.useState(false);
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button 
            onClick={copyToClipboard} 
            className="copy-button" 
            title={copied ? "Copied!" : "Copy to clipboard"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                    <path d="M20 6L9 17l-5-5"/>
                ) : (
                    <>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </>
                )}
            </svg>
        </button>
    );
};

const ProcessingIndicator = ({ isVisible }) => (
    <div className={`processing-file ${!isVisible ? 'hidden' : ''}`}>
        <div className="loading-spinner" />
        <h3>Processing File...</h3>
        <p>Please wait while we process your content</p>
    </div>
);

const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const handleError = (error) => {
            setHasError(true);
            setError(error);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
        return (
            <div className="error-boundary">
                <h2>Something went wrong</h2>
                <details>
                    <summary>Error details</summary>
                    <pre>{error?.message || 'Unknown error'}</pre>
                </details>
                <button onClick={() => window.location.reload()}>
                    Reload Page
                </button>
            </div>
        );
    }

    return children;
};

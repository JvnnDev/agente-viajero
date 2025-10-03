class GraphManager {
    constructor(containerRef) {
        this.cy = null;
        this.containerRef = containerRef;
    }

    /**
     * Inicializa el grafo (no explicar esto, ya q es parametrizacion xd)
     */
    initialize() {
        if (this.containerRef && !this.cy) {
            this.cy = cytoscape({
                container: this.containerRef,

                zoomingEnabled: true,
                userZoomingEnabled: true,
                panningEnabled: true,
                userPanningEnabled: true,
                minZoom: 0.5,
                maxZoom: 3,
                wheelSensitivity: 0.2,

                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': '#2563eb',
                            'label': 'data(label)',
                            'color': '#fff',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'font-size': '16px',
                            'font-weight': 'bold',
                            'width': '50px',
                            'height': '50px',
                            'border-width': 3,
                            'border-color': '#1e40af'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 3,
                            'line-color': '#999',
                            'label': 'data(weight)',
                            'font-size': '12px',
                            'text-background-color': '#fff',
                            'text-background-opacity': 1,
                            'text-background-padding': '3px',
                            'curve-style': 'bezier'
                        }
                    },
                    {
                        selector: 'edge.optimal',
                        style: {
                            'width': 5,
                            'line-color': '#10b981',
                            'target-arrow-color': '#10b981',
                            'z-index': 999
                        }
                    }
                ],
                layout: { 
                    name: 'circle',
                    animate: true,
                    animationDuration: 500
                }
            });
        }
    }

    /**
     * Actualiza el grafo con nuevos nodos y aristas
     */
    update(nodes, edges) {
        if (!this.cy) return;

        this.cy.elements().remove();
        
        nodes.forEach(node => {
            this.cy.add({ group: 'nodes', data: node });
        });
        
        edges.forEach(edge => {
            this.cy.add({ group: 'edges', data: edge });
        });

        this.cy.layout({ 
            name: 'circle', 
            animate: true,
            animationDuration: 500 
        }).run();
    }

    /**
     * Resetea el zoom del grafo al nivel inicial
     */
    resetZoom() {
        if (this.cy) {
            this.cy.fit();
            this.cy.center();
        }
    }

    /**
     * Resalta la ruta optima
     */
    highlightOptimalRoute(route) {
        if (!this.cy) return;

        this.cy.edges().removeClass('optimal');

        for (let i = 0; i < route.length; i++) {
            const from = route[i];
            const to = route[(i + 1) % route.length];
            
            const edge = this.cy.edges().filter(e => {
                const src = e.data('source');
                const tgt = e.data('target');
                return (src === from && tgt === to) || (src === to && tgt === from);
            });
            
            edge.addClass('optimal');
        }
    }

    /**
     * genera un grafo random
     */
    static generateRandomGraph(numNodes) {
        const nodes = [];
        const edges = [];

        for (let i = 0; i < numNodes; i++) {
            nodes.push({
                id: `n${i}`,
                label: String.fromCharCode(65 + i)
            });
        }

        for (let i = 0; i < numNodes; i++) {
            for (let j = i + 1; j < numNodes; j++) {
                const weight = Math.floor(Math.random() * 50) + 10;
                edges.push({
                    id: `e${i}-${j}`,
                    source: `n${i}`,
                    target: `n${j}`,
                    weight: weight
                });
            }
        }

        return { nodes, edges };
    }

    /**
     * Obtiene el peso de una arista entre dos nodos
     */
    static getEdgeWeight(edges, from, to) {
        const edge = edges.find(e => 
            (e.source === from && e.target === to) || 
            (e.source === to && e.target === from)
        );
        return edge ? edge.weight : 0;
    }
}
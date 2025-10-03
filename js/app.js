/**
 * TSP Solver React Application
 * Jude Alessandro Hermoza Quispe (u202318220)
 */

const { useState, useEffect, useRef } = React;

function TSPApp() {
    // Estados
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [numNodes, setNumNodes] = useState(8);
    const [results, setResults] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [stats, setStats] = useState({ 
        totalRoutes: 0, 
        optimalCost: 0, 
        execTime: 0 
    });

    // Referencias
    const cyRef = useRef(null);
    const graphManager = useRef(null);

    // Inicializa el grafo
    useEffect(() => {
        if (cyRef.current && !graphManager.current) {
            graphManager.current = new GraphManager(cyRef.current);
            graphManager.current.initialize();
        }
    }, []);

    // Actualiza el grafo cuando cambian nodos/aristas
    useEffect(() => {
        if (graphManager.current) {
            graphManager.current.update(nodes, edges);
        }
    }, [nodes, edges]);

    // Genera grafo aleatorio
    const generateRandomGraph = () => {
        const { nodes: newNodes, edges: newEdges } = 
            GraphManager.generateRandomGraph(numNodes);
        
        setNodes(newNodes);
        setEdges(newEdges);
        setResults([]);
        setStats({ totalRoutes: 0, optimalCost: 0, execTime: 0 });
    };

    // Limpia el grafo
    const clearGraph = () => {
        setNodes([]);
        setEdges([]);
        setResults([]);
        setStats({ totalRoutes: 0, optimalCost: 0, execTime: 0 });
    };

    // Resuelve el TSP
    const solveTSP = () => {
        if (nodes.length < 3) {
            alert('Necesitas al menos 3 nodos para resolver el TSP');
            return;
        }

        setIsCalculating(true);

        // Usa setTimeout para no bloquear la UI
        setTimeout(() => {
            try {
                const getWeight = (from, to) => 
                    GraphManager.getEdgeWeight(edges, from, to);

                const { results: allResults, stats: newStats } = 
                    TSPSolver.solve(nodes, getWeight);

                setResults(allResults);
                setStats(newStats);
                
                // Resalta la ruta óptima
                if (graphManager.current) {
                    graphManager.current.highlightOptimalRoute(newStats.optimalRoute);
                }
            } catch (error) {
                alert('Error: ' + error.message);
            } finally {
                setIsCalculating(false);
            }
        }, 100);
    };

    // Exporta resultados
    const exportResults = () => {
        if (results.length === 0) {
            alert('No hay resultados para exportar');
            return;
        }
        TSPSolver.exportResults(nodes, results, stats);
    };

    // Resetea el zoom del grafo
    const resetZoom = () => {
        if (graphManager.current) {
            graphManager.current.resetZoom();
        }
    };

    // Map de IDs a labels
    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n.label; });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 animate-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text gradient-bg mb-3">
                        TSP Solver
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Problema del Agente Viajero | Algoritmo de Fuerza Bruta
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Por: Jude Alessandro Hermoza Quispe (u202318220)
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-center">
                        <div className="flex items-center gap-2">
                            <label className="font-semibold text-gray-700">Nodos:</label>
                            <input 
                                type="number" 
                                min="4" 
                                max="12" 
                                value={numNodes}
                                onChange={(e) => setNumNodes(parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={generateRandomGraph}
                            className="gradient-btn text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Generar Aleatorio
                        </button>
                        <button
                            onClick={clearGraph}
                            className="gradient-danger text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={solveTSP}
                            disabled={isCalculating || nodes.length < 3}
                            className="gradient-success text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCalculating ? 'Calculando...' : 'Resolver TSP'}
                        </button>
                        <button
                            onClick={exportResults}
                            disabled={results.length === 0}
                            className="gradient-info text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
                        >
                            Exportar
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-4 text-center">
                        <strong>Instrucciones:</strong> Genera un grafo aleatorio de 4-12 nodos y presiona "Resolver TSP"
                    </p>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Graph */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xl font-bold text-gray-800">Grafo</h3>
                            <button
                                onClick={resetZoom}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                                Centrar Vista
                            </button>
                        </div>
                        <div ref={cyRef} id="cy" className="w-full h-96 bg-gray-50"></div>
                    </div>

                    {/* Results */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Resultados</h3>
                        <div className="bg-gray-50 rounded-xl p-4 h-96 overflow-y-auto scrollbar-custom">
                            {results.length === 0 ? (
                                <p className="text-gray-500 text-center py-20">
                                    Genera un grafo y resuelve el TSP para ver los resultados
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {results.map((result, index) => (
                                        <div 
                                            key={index}
                                            className={`route-card p-4 rounded-lg ${
                                                index === 0 
                                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500' 
                                                    : 'bg-white border-l-4 border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-gray-800 text-sm">
                                                    {result.route.map(id => nodeMap[id]).join(' → ')} → {nodeMap[result.route[0]]}
                                                </span>
                                                {index === 0 && (
                                                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                        ÓPTIMA
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Costo: <span className="font-bold text-gray-800">{result.cost}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                {results.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 animate-in">
                        <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">{stats.totalRoutes}</div>
                            <div className="text-gray-700 font-medium">Rutas Evaluadas</div>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">{stats.optimalCost}</div>
                            <div className="text-gray-700 font-medium">Costo Óptimo</div>
                        </div>
                        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">{stats.execTime}ms</div>
                            <div className="text-gray-700 font-medium">Tiempo de Ejecución</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Renderiza la aplicación
ReactDOM.render(<TSPApp />, document.getElementById('root'));
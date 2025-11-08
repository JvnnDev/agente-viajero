const { useState, useEffect, useRef } = React;

function TSPApp() {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [numNodes, setNumNodes] = useState(8);
    const [results, setResults] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);
    const [algorithm, setAlgorithm] = useState('auto');
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualNodes, setManualNodes] = useState('');
    const [manualEdges, setManualEdges] = useState('');
    const [stats, setStats] = useState({
        totalRoutes: 0,
        optimalCost: 0,
        execTime: 0,
        algorithm: ''
    });

    const cyRef = useRef(null);
    const graphManager = useRef(null);

    // se inicializa el grafo
    useEffect(() => {
        if (cyRef.current && !graphManager.current) {
            graphManager.current = new GraphManager(cyRef.current);
            graphManager.current.initialize();
        }
    }, []);

    // update del grafo cuando cambia un nodo o arista
    useEffect(() => {
        if (graphManager.current) {
            graphManager.current.update(nodes, edges);
        }
    }, [nodes, edges]);

    const generateRandomGraph = () => {
        const { nodes: newNodes, edges: newEdges } = 
            GraphManager.generateRandomGraph(numNodes);
        
        setNodes(newNodes);
        setEdges(newEdges);
        setResults([]);
        setStats({ totalRoutes: 0, optimalCost: 0, execTime: 0 });
    };

    const clearGraph = () => {
        setNodes([]);
        setEdges([]);
        setResults([]);
        setStats({ totalRoutes: 0, optimalCost: 0, execTime: 0 });
    };

    const loadManualGraph = () => {
        try {
            // Parse nodes: format "A,B,C,D"
            const nodeLabels = manualNodes.split(',').map(s => s.trim()).filter(s => s);
            if (nodeLabels.length < 3) {
                alert('Necesitas al menos 3 nodos');
                return;
            }

            const newNodes = nodeLabels.map((label, index) => ({
                id: `node${index}`,
                label: label
            }));

            // Parse edges: format "A-B:10,B-C:15,A-C:20"
            const edgeData = manualEdges.split(',').map(s => s.trim()).filter(s => s);
            const newEdges = [];

            for (let edgeStr of edgeData) {
                const [connection, weightStr] = edgeStr.split(':');
                const [from, to] = connection.split('-').map(s => s.trim());
                const weight = parseInt(weightStr);

                if (!from || !to || isNaN(weight)) {
                    alert(`Formato inválido en arista: ${edgeStr}`);
                    return;
                }

                const fromNode = newNodes.find(n => n.label === from);
                const toNode = newNodes.find(n => n.label === to);

                if (!fromNode || !toNode) {
                    alert(`Nodo no encontrado en: ${edgeStr}`);
                    return;
                }

                newEdges.push({
                    from: fromNode.id,
                    to: toNode.id,
                    weight: weight
                });
            }

            setNodes(newNodes);
            setEdges(newEdges);
            setResults([]);
            setStats({ totalRoutes: 0, optimalCost: 0, execTime: 0, algorithm: '' });
            setShowManualInput(false);
        } catch (error) {
            alert('Error al cargar el grafo: ' + error.message);
        }
    };

    const solveTSP = () => {
        if (nodes.length < 3) {
            alert('Necesitas al menos 3 nodos para resolver el TSP');
            return;
        }

        setIsCalculating(true);

        setTimeout(() => {
            try {
                const getWeight = (from, to) =>
                    GraphManager.getEdgeWeight(edges, from, to);

                const { results: allResults, stats: newStats } =
                    TSPSolver.solve(nodes, getWeight, algorithm);

                setResults(allResults);
                setStats(newStats);

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

    const exportResults = () => {
        if (results.length === 0) {
            alert('No hay resultados para exportar');
            return;
        }
        TSPSolver.exportResults(nodes, edges, results, stats);
    };

    const resetZoom = () => {
        if (graphManager.current) {
            graphManager.current.resetZoom();
        }
    };

    const nodeMap = {};
    nodes.forEach(n => { nodeMap[n.id] = n.label; });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 animate-in">
                {}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-transparent bg-clip-text gradient-bg mb-3">
                        TSP Solver
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Problema del Agente Viajero | Múltiples Algoritmos
                    </p>
                    <div className="text-sm text-gray-500 mt-2">
                        <div className="mb-1"><strong>Integrantes:</strong></div>
                        <div>Steven Angel Coaila Zaa (u202216463)</div>
                        <div>Jude Alessandro Hermoza Quispe (u202318220)</div>
                        <div>Nicolas Tantalean Granda (u202410728)</div>
                        <div>Renzo Piero Santos Minaya (u202114790)</div>
                        <div>Santiago Luis Nahui Arroyo (u202320691)</div>
                    </div>
                </div>

                {}
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
                        <div className="flex items-center gap-2">
                            <label className="font-semibold text-gray-700">Nodos:</label>
                            <input
                                type="number"
                                min="3"
                                max="20"
                                value={numNodes}
                                onChange={(e) => setNumNodes(parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="font-semibold text-gray-700">Algoritmo:</label>
                            <select
                                value={algorithm}
                                onChange={(e) => setAlgorithm(e.target.value)}
                                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            >
                                <option value="auto">Auto (Recomendado)</option>
                                <option value="bruteforce">Fuerza Bruta (≤10 nodos)</option>
                                <option value="heldkarp">Held-Karp DP (11+ nodos)</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center justify-center">
                        <button
                            onClick={generateRandomGraph}
                            className="gradient-btn text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Generar Aleatorio
                        </button>
                        <button
                            onClick={() => setShowManualInput(!showManualInput)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            {showManualInput ? 'Cancelar' : 'Entrada Manual'}
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

                    {showManualInput && (
                        <div className="mt-6 bg-white rounded-lg p-4 border-2 border-yellow-300">
                            <h4 className="font-bold text-gray-800 mb-3">Entrada Manual de Grafo</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nodos (separados por comas):
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="A,B,C,D"
                                        value={manualNodes}
                                        onChange={(e) => setManualNodes(e.target.value)}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Aristas (formato: origen-destino:peso, separadas por comas):
                                    </label>
                                    <textarea
                                        placeholder="A-B:10,B-C:15,C-D:20,D-A:25,A-C:12,B-D:18"
                                        value={manualEdges}
                                        onChange={(e) => setManualEdges(e.target.value)}
                                        rows="3"
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                                    />
                                </div>
                                <button
                                    onClick={loadManualGraph}
                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Cargar Grafo Manual
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-gray-600 mt-4 text-center">
                        <strong>Instrucciones:</strong> Genera un grafo aleatorio o crea uno manual, luego presiona "Resolver TSP"
                    </p>
                </div>

                {}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {}
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

                    {}
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            Resultados {results.length > 0 && stats.algorithm !== 'Fuerza Bruta' && (
                                <span className="text-sm font-normal text-gray-600">(Mejor ruta encontrada)</span>
                            )}
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-4 h-96 overflow-y-auto scrollbar-custom">
                            {results.length === 0 ? (
                                <p className="text-gray-500 text-center py-20">
                                    Genera un grafo y resuelve el TSP para ver los resultados
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {results.length === 1 && stats.algorithm !== 'Fuerza Bruta' && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3 text-xs text-gray-700">
                                            <strong>💡 Tip:</strong> {stats.algorithm} encuentra la mejor solución directamente.
                                            Si quieres ver todas las rutas posibles, usa "Fuerza Bruta" con ≤10 nodos.
                                        </div>
                                    )}
                                    {results.slice(0, 100).map((result, index) => (
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
                                                {results.length > 1 && index > 0 && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        (Ruta #{index + 1})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {results.length > 100 && (
                                        <div className="text-center text-sm text-gray-500 py-2">
                                            ... y {(results.length - 100).toLocaleString()} rutas más
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {}
                {results.length > 0 && (
                    <div className="animate-in">
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                                <div className="text-4xl font-bold text-purple-600 mb-2">{stats.totalRoutes.toLocaleString()}</div>
                                <div className="text-gray-700 font-medium">
                                    {stats.algorithm === 'Fuerza Bruta' ? 'Rutas Evaluadas' : 'Solución Encontrada'}
                                </div>
                            </div>
                            <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                                <div className="text-4xl font-bold text-green-600 mb-2">{stats.optimalCost}</div>
                                <div className="text-gray-700 font-medium">Costo Óptimo</div>
                            </div>
                            <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                                <div className="text-4xl font-bold text-blue-600 mb-2">{stats.execTime}ms</div>
                                <div className="text-gray-700 font-medium">Tiempo de Ejecución</div>
                            </div>
                            <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
                                <div className="text-lg font-bold text-orange-600 mb-2">{stats.algorithm}</div>
                                <div className="text-gray-700 font-medium">Algoritmo Usado</div>
                            </div>
                        </div>
                        {stats.algorithm === 'Held-Karp (DP)' && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg text-sm text-gray-700">
                                <strong>ℹ️ Nota:</strong> Held-Karp usa programación dinámica para encontrar la solución óptima directamente sin generar todas las permutaciones. Por eso es tan rápido.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

ReactDOM.render(<TSPApp />, document.getElementById('root'));
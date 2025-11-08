class TSPSolver {
    /**
     * Genera todas las permutaciones de un array
     * @param {Array} arr - Array de elementos
     * @returns {Array} Array de permutaciones
     */
    static permute(arr) {
        if (arr.length <= 1) return [arr];
        const result = [];

        for (let i = 0; i < arr.length; i++) {
            const current = arr[i];
            const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
            const perms = this.permute(remaining);

            for (let perm of perms) {
                result.push([current, ...perm]);
            }
        }

        return result;
    }

    /**
     * Calcula el costo de una ruta completa
     * @param {Array} route - Array de IDs de nodos
     * @param {Function} getWeight - Función para obtener peso entre nodos
     * @returns {number} Costo total de la ruta
     */
    static calculateRouteCost(route, getWeight) {
        let cost = 0;

        // Suma costos entre nodos consecutivos
        for (let i = 0; i < route.length - 1; i++) {
            cost += getWeight(route[i], route[i + 1]);
        }

        // Cierra el ciclo (regreso al inicio)
        cost += getWeight(route[route.length - 1], route[0]);

        return cost;
    }

    /**
     * Algoritmo Held-Karp (Dynamic Programming)
     * Complejidad: O(n^2 * 2^n) - Mucho más rápido que fuerza bruta para n > 10
     * @param {Array} nodes - Array de nodos
     * @param {Function} getWeight - Función para obtener peso entre nodos
     * @returns {Object} Resultados con la ruta óptima
     */
    static solveHeldKarp(nodes, getWeight) {
        if (nodes.length < 3) {
            throw new Error('Se necesitan al menos 3 nodos para resolver el TSP');
        }

        const startTime = performance.now();
        const n = nodes.length;
        const nodeIds = nodes.map(n => n.id);

        // Crear índice de nodos
        const nodeIndex = {};
        nodeIds.forEach((id, idx) => { nodeIndex[id] = idx; });

        // Memo: Map con key = "subset,lastNode"
        const memo = new Map();

        // Función para calcular el costo óptimo de visitar un subset de nodos terminando en 'last'
        function dp(subset, last) {
            // Caso base: solo queda el nodo inicial
            if (subset.size === 1) {
                return getWeight(nodeIds[0], nodeIds[last]);
            }

            const key = `${Array.from(subset).sort().join(',')},${last}`;
            if (memo.has(key)) {
                return memo.get(key);
            }

            let minCost = Infinity;

            // Probar todos los nodos previos posibles
            for (let prev of subset) {
                if (prev === last) continue;

                const newSubset = new Set(subset);
                newSubset.delete(last);

                const cost = dp(newSubset, prev) + getWeight(nodeIds[prev], nodeIds[last]);
                minCost = Math.min(minCost, cost);
            }

            memo.set(key, minCost);
            return minCost;
        }

        // Encontrar el costo mínimo
        const allNodes = new Set(Array.from({ length: n }, (_, i) => i));
        let optimalCost = Infinity;
        let lastNode = -1;

        for (let i = 1; i < n; i++) {
            const cost = dp(allNodes, i) + getWeight(nodeIds[i], nodeIds[0]);
            if (cost < optimalCost) {
                optimalCost = cost;
                lastNode = i;
            }
        }

        // Reconstruir la ruta óptima
        function reconstructPath() {
            const path = [0];
            let currentSubset = new Set(Array.from({ length: n }, (_, i) => i));
            let current = lastNode;

            while (currentSubset.size > 1) {
                path.push(current);
                const next = current;
                currentSubset.delete(current);

                // Encontrar el nodo anterior óptimo
                let bestPrev = -1;
                let bestCost = Infinity;

                for (let prev of currentSubset) {
                    if (prev === 0 && currentSubset.size > 1) continue;
                    const key = `${Array.from(currentSubset).sort().join(',')},${next}`;
                    const prevKey = `${Array.from(currentSubset).filter(x => x !== next).sort().join(',')},${prev}`;

                    let cost;
                    if (currentSubset.size === 1) {
                        cost = getWeight(nodeIds[0], nodeIds[next]);
                    } else {
                        const newSubset = new Set(currentSubset);
                        newSubset.delete(next);
                        cost = dp(newSubset, prev) + getWeight(nodeIds[prev], nodeIds[next]);
                    }

                    if (cost < bestCost) {
                        bestCost = cost;
                        bestPrev = prev;
                    }
                }

                current = bestPrev;
            }

            return path.map(idx => nodeIds[idx]);
        }

        const optimalRoute = reconstructPath();
        const endTime = performance.now();

        return {
            results: [{ route: optimalRoute, cost: optimalCost }],
            stats: {
                totalRoutes: 1,
                optimalCost: optimalCost,
                optimalRoute: optimalRoute,
                execTime: (endTime - startTime).toFixed(2),
                algorithm: 'Held-Karp (DP)'
            }
        };
    }


    /**
     * Resuelve el TSP usando fuerza bruta (solo para grafos pequeños <= 10 nodos)
     * @param {Array} nodes - Array de nodos
     * @param {Function} getWeight - Función para obtener peso entre nodos
     * @returns {Object} Resultados con todas las rutas evaluadas
     */
    static solveBruteForce(nodes, getWeight) {
        if (nodes.length < 3) {
            throw new Error('Se necesitan al menos 3 nodos para resolver el TSP');
        }

        const startTime = performance.now();
        const results = [];

        // Fija el primer nodo como inicio
        const startNode = nodes[0].id;
        const otherNodes = nodes.slice(1).map(n => n.id);

        // Genera todas las permutaciones de los nodos restantes
        const permutations = this.permute(otherNodes);

        // Evalúa cada permutación
        permutations.forEach(perm => {
            const route = [startNode, ...perm];
            const cost = this.calculateRouteCost(route, getWeight);
            results.push({ route, cost });
        });

        // Ordena por costo (ascendente)
        results.sort((a, b) => a.cost - b.cost);

        const endTime = performance.now();

        return {
            results,
            stats: {
                totalRoutes: results.length,
                optimalCost: results[0].cost,
                optimalRoute: results[0].route,
                execTime: (endTime - startTime).toFixed(2),
                algorithm: 'Fuerza Bruta'
            }
        };
    }

    /**
     * Resuelve el TSP usando el mejor algoritmo según el tamaño del grafo
     * @param {Array} nodes - Array de nodos
     * @param {Function} getWeight - Función para obtener peso entre nodos
     * @param {string} algorithm - Tipo de algoritmo ('auto', 'bruteforce', 'heldkarp')
     * @returns {Object} Resultados
     */
    static solve(nodes, getWeight, algorithm = 'auto') {
        const n = nodes.length;

        if (algorithm === 'auto') {
            if (n <= 10) {
                return this.solveBruteForce(nodes, getWeight);
            } else {
                return this.solveHeldKarp(nodes, getWeight);
            }
        } else if (algorithm === 'bruteforce') {
            return this.solveBruteForce(nodes, getWeight);
        } else if (algorithm === 'heldkarp') {
            return this.solveHeldKarp(nodes, getWeight);
        }

        throw new Error('Algoritmo no reconocido');
    }

    /**
     * Exporta los resultados a JSON
     * @param {Array} nodes - Nodos del grafo
     * @param {Array} edges - Aristas del grafo
     * @param {Array} results - Resultados del TSP
     * @param {Object} stats - Estadísticas
     */
    static exportResults(nodes, edges, results, stats) {
        const nodeMap = {};
        nodes.forEach(n => { nodeMap[n.id] = n.label; });

        const exportData = {
            metadata: {
                fecha: new Date().toLocaleString('es-PE'),
                integrantes: [
                    { nombre: 'Steven Angel Coaila Zaa', codigo: 'u202216463' },
                    { nombre: 'Jude Alessandro Hermoza Quispe', codigo: 'u202318220' },
                    { nombre: 'Nicolas Tantalean Granda', codigo: 'u202410728' },
                    { nombre: 'Renzo Piero Santos Minaya', codigo: 'u202114790' },
                    { nombre: 'Santiago Luis Nahui Arroyo', codigo: 'u202320691' }
                ],
                curso: 'MA475 - Matemática Computacional',
                profesor: 'Jonathan Abrahan Sueros Zarate',
                universidad: 'Universidad Peruana de Ciencias Aplicadas'
            },
            configuracion: {
                numeroNodos: nodes.length,
                nodos: nodes.map(n => n.label),
                numeroAristas: edges.length,
                algoritmo: stats.algorithm || 'No especificado'
            },
            estadisticas: stats,
            grafo: {
                nodos: nodes.map(n => ({ id: n.id, label: n.label })),
                aristas: edges.map(e => ({
                    desde: nodeMap[e.from],
                    hasta: nodeMap[e.to],
                    peso: e.weight
                }))
            },
            rutas: results.map((r, index) => ({
                numero: index + 1,
                ruta: r.route.map(id => nodeMap[id]).join(' → ') + ' → ' + nodeMap[r.route[0]],
                costo: r.cost,
                esOptima: index === 0
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TSP_${nodes.length}nodos_${stats.algorithm || 'algoritmo'}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
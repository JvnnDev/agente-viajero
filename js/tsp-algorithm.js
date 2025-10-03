/**
 * TSP Algorithm - Brute Force Implementation
 * Jude Alessandro Hermoza Quispe (u202318220)
 * MA475 - Matemática Computacional
 */

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
     * Resuelve el TSP usando fuerza bruta
     * @param {Array} nodes - Array de nodos
     * @param {Function} getWeight - Función para obtener peso entre nodos
     * @returns {Object} Resultados con todas las rutas evaluadas
     */
    static solve(nodes, getWeight) {
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
                execTime: (endTime - startTime).toFixed(2)
            }
        };
    }

    /**
     * Exporta los resultados a JSON
     * @param {Array} nodes - Nodos del grafo
     * @param {Array} results - Resultados del TSP
     * @param {Object} stats - Estadísticas
     */
    static exportResults(nodes, results, stats) {
        const nodeMap = {};
        nodes.forEach(n => { nodeMap[n.id] = n.label; });

        const exportData = {
            metadata: {
                fecha: new Date().toLocaleString('es-PE'),
                estudiante: 'Jude Alessandro Hermoza Quispe',
                codigo: 'u202318220',
                curso: 'MA475 - Matemática Computacional',
                profesor: 'Jonathan Abrahan Sueros Zarate',
                universidad: 'Universidad Peruana de Ciencias Aplicadas'
            },
            configuracion: {
                numeroNodos: nodes.length,
                nodos: nodes.map(n => n.label)
            },
            estadisticas: stats,
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
        a.download = `TSP_${nodes.length}nodos_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}


class Memory {
    constructor(capacity, cleanFun) {
        // Setare capacitate maximă
        this.capacity = capacity || 5000
        // Inițiere listă
        this.experiences = []
        // Setare funcție de curățare a memoriei fizice pentru valorile care vor fi distruse
        this.cleanFun = cleanFun
    }

    // Funcție care adaugă o experiență în listă
    add(exper) {
        // Verific dacă am depășit capacitatea
        if (this.experiences.length + 1 > this.capacity) {
            // Scot elementul vechi din listă
            const exper = this.experiences.shift()
            // Curăț elementul din memoria fizică
            this.cleanFun?.(exper)
        }
        // Adaug nouă experiență
        this.experiences.push(exper)
    }

    // Preiau o serie fixă de experiențe amestecate aleatoriu din lista
    sample(batch) {
        // Amestec toate experiențele
        const randomExperiences = Memory.shuffle([...this.experiences])
        // Preiau primele experiențe ca serie
        return randomExperiences.slice(0, batch)
    }

    // Golosesc toată lista de experiențe
    clean() {
        // Aplic funcție de curățare a memorie fizice
        // că să nu am posibile reziduri
        this.experiences.forEach(exper => {
            this.cleanFun?.(exper)
        })
        this.experiences = []
    }

    // Amestec o copie a unui vector dat folosind algoritmul Fisher–Yates Shuffle
    static shuffle(array) {
        // Inițiere variabile
        let m = array.length, t, i;
        // Cât timp mai sunt elemente de amestecat
        while (m) {
            // Iau o poziție aleatorie
            i = Math.floor(Math.random() * m--);
            // Fac schimb de poziții cu elementul din poziția m
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }
}

export default Memory
// https://bost.ocks.org/mike/shuffle/
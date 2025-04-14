const sheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-sXMewwaWgQA9ML04jtPdNluciNPW87eIJ_D-AAlsp8r3jAaIqEbibOpVcOO1Xv723FH9AYqGmeW4/pub?output=csv";
const response = await fetch(sheets);
const csvText = await response.text();

const sanitizeName = (name) => {
  const accentsMap = new Map([ ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'], ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'], ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'], ['ø', 'o'], ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ý', 'y'], ['ÿ', 'y'], ['ñ', 'n'], ['ç', 'c'],['œ','oe'] ]);
  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};


/**
 * Convertit une chaîne CSV en objet JSON en utilisant ES6
 * @param {string} csvString - La chaîne CSV à convertir
 * @returns {Array} - Tableau d'objets représentant les données CSV
 */
const csvToJson = (csvString) => {
  try {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue);
      
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        value = value.replace(/\r/g, '');

        if (value.includes('\n')) {
          value = value.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        }
        
        obj[header] = value;
      });
      
      result.push(obj);
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};




const bgColors = ["black"];

const _json = csvToJson(csvText);

// ajoute 6 fois _json dans const json
const json = [..._json,..._json,..._json,..._json];



const $projets = document.querySelector(".projets");

// parcourir le json et créer les éléments
json.forEach((item) => {
  const div = document.createElement("div");
  div.classList.add("vignette");
  $projets.appendChild(div);
  // gsap.set(div,{backgroundColor: e => gsap.utils.random(bgColors)});
  // gsap.from(div, {
  //   x: e=> gsap.utils.random(-1000,1000),
  //   y : e  => gsap.utils.random(-1000,-20),
  //   opacity:0, duration: 0.5 });
  

  const img = document.createElement("img");
  img.src = `img/${item.titre}.jpg`;
  div.appendChild(img);


  const titre = document.createElement("h1");
  titre.textContent = item.titre;
  div.appendChild(titre);
  const fonts = ["courier"];
  let previousFont = null;

  titre.style.whiteSpace = "nowrap";
  console.log(titre.offsetWidth);
  div.style.width = `${titre.offsetWidth + 120}px`;
  div.addEventListener("mouseenter", () => {
    document.querySelectorAll(".vignette h1").forEach((h1) => {
      if (h1 !== titre) {
        h1.style.opacity = "0.2";
      }
    });
  });

  div.addEventListener("mouseleave", () => {
    document.querySelectorAll(".vignette h1").forEach((h1) => {
      h1.style.opacity = "1";
    });
  });


  const categories = document.createElement("div");
  categories.textContent = item.catégories;
  div.appendChild(categories);

  const description = document.createElement("p");
  description.textContent = item.description;
  div.appendChild(description);


  description.style.display = "none";

  div.addEventListener("mouseenter", () => {
    description.style.display = "block";
  });

  div.addEventListener("mouseleave", () => {
    description.style.display = "none";
  });
div.addEventListener("click", () => {
  const header = document.querySelector("header");
  header.classList.add("fixed");

  const projets = document.querySelector(".projets");
  projets.classList.add("fixed");

  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  document.body.appendChild(overlay);

  const wrap = document.createElement("div");
  wrap.classList.add("wrap");
  overlay.appendChild(wrap);

  const fiche = document.createElement("div");
  fiche.classList.add("fiche");
  wrap.appendChild(fiche);

  const close = document.createElement("div");
  close.textContent = "×";
  close.classList.add("close");
  overlay.appendChild(close);

    // amélioration de la fermeture de la fiche
    overlay.addEventListener("click", (e) => {
      if (e.target === fiche || fiche.contains(e.target)) return;
      gsap.to(overlay, {opacity: 0, duration: 0.2, onComplete: () => overlay.remove()});
      header.classList.remove("fixed");
      projets.classList.remove("fixed");
    });

  const img = document.createElement("img");
  img.src = `img/${item.titre}.jpg`;
  fiche.appendChild(img);

  const titre = document.createElement("h1");
  titre.textContent = item.titre;
  fiche.appendChild(titre);

  const desc = document.createElement("div");
  desc.innerHTML = item.modale;
  fiche.appendChild(desc);

  if(item.images !== "") {
    const images = item.images.split(",");
    const gallery = document.createElement("div");
    gallery.classList.add("gallery");
    images.forEach((image) => {
      const img = document.createElement("img");
      const name = sanitizeName(item.titre);
      img.src = `img/${name}/${image}`;
      gallery.appendChild(img);
    });
    fiche.appendChild(gallery);
  }


  // gsap.from(fiche, {opacity: 0, duration: 0.4});
  // gsap.from(overlay, {opacity: 0, duration: 0.4});
  
});
});


// base pour le plugin motionPath
gsap.registerPlugin(MotionPathPlugin);
// base pour la position selon le viewport
const w = window.innerWidth;
const h = window.innerHeight;

// question ia :
// je veux le chemin d'un path en forme d'ellipse avec un rayon de (h-100)/2 et (w-100)/2 (avec quelques modifications)

// const centerX = w*1.02; // Centre en bas à droite de l'écran
// const centerY = h*1.02; // Centre en bas à droite de l'écran
// const radius = Math.min(w, h) / 1; // Rayon basé sur la plus petite dimension de l'écran

// const d = `M ${centerX}, ${centerY - radius} 
//   A ${radius},${radius} 1,0,0 ${centerX - radius}, ${centerY}`;


const d = `M -${w / 5}, ${h / 4} L ${w * 1.5}, ${h / 1}`;
document.body.style.overflow = "hidden";
document.documentElement.style.overflow = "hidden";

const overlayStyle = document.createElement("style");
overlayStyle.textContent = `
  .overlay {
    overflow-y: auto !important;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`;
document.head.appendChild(overlayStyle);

// pour la demo
// ajoute le path dans un svg
    const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg1.setAttribute("width", w);
    svg1.setAttribute("height", h);
    document.body.appendChild(svg1);
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", d);
    path1.setAttribute("stroke", "red");
    path1.setAttribute("fill", "none");
    svg1.appendChild(path1);
    path1.setAttribute("stroke-opacity", "0");


    // SVG sur z-index -1
    svg1.style.position = "absolute";
    svg1.style.top = 0;
    svg1.style.left = 0;
    svg1.style.zIndex = -1;


    gsap.set(".vignette", {
      xPercent: -50, 
      yPercent: -50, 
      transformOrigin: "50% 50%"
     });

let anim = gsap.to('.vignette', {
  motionPath: {
    path: d,
    align: path1,
    alignOrigin: [0.5, 0.5],
  },
  duration: 6,
  stagger: {
    each: 1*0.88,
    repeat: -1,
  },
  ease: "none"
});

anim.pause();
anim.play(200);


document.addEventListener("mousemove", (event) => {
  const cursorX = event.clientX;
  const cursorY = event.clientY;

  const pathLength = path1.getTotalLength();
  let closestPoint = null;
  let minDistance = Infinity;

  for (let i = 0; i <= pathLength; i += 5) {
    const point = path1.getPointAtLength(i);
    const distance = Math.hypot(cursorX - point.x, cursorY - point.y);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = point;
    }
  }

  const maxDistance = 400; // Distance maximale pour ralentir
  const clampedDistance = Math.min(minDistance, maxDistance);
  const speedFactor = 0.5 + (clampedDistance / maxDistance) * 0.8; // Ajuste la vitesse entre 0.5 et 1

  anim.timeScale(speedFactor); // Ajuste la vitesse en fonction de la proximité
});


document.querySelectorAll(".vignette h1, .vignette p").forEach((element) => {
  element.addEventListener("mouseenter", () => {
    anim.pause();
  });

  element.addEventListener("mouseleave", () => {
    anim.play();
  });
});




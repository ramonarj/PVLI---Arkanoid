# PVLI---Arkanoid
Repositorio para el remake del Arkanoid 

Raúl Fernández Guardia 
Ramón Arjona Quiñones

# DOCUMENTO DE DISEÑO:
## 1. Descripción
El objetivo el juego es destruir todos los ladrillos que se encuentran por encima de la nave que controla el jugador. Algunos de estos tienen power-ups que ayudan a destruirlos, y cada cierto tiempo salen enemigos.

Si la bola pasa por debajo del jugador, este pierde.

## 2. Cantidades:
**Jugador**  
  
**Niveles:** 36 (haremos los que nos dé tiempo).  
  
**Vidas:** 3 iniciales (la actual +2), infinitas posibles.  
  
**Power ups:** 7 [A=acumulable].  
- Azul marino: se hace grande (A, 2).  
- Roja: disparar hacia arriba.  
- Verde: parar la bola.  
- Azul claro: triplicar la bola (A).  
- Gris: vida extra (A).  
- Rosa: abre una puerta al siguiente nivel.  
- Naranja: bola más lenta (A).  
      
**Tipos de ladrillos:** dan diferente nº de puntos   
- Blanco: 50  
- Naranja: 60  
- Azul claro: 70  
- Verde: 80  
- Rojo: 90  
- Azul: 100  
- Rosa: 110  
- Amarillo: 120  
- Plateados: 50xnº nivel (se destruyen de 3 golpes)  
- Dorados: ni dan puntos ni se destruyen  
      
**Enemigos:** se destruyen de un golpe de bola/bala o si les da la nave. 
    Se mueven hacia abajo lento,  
    desapareciendo por debajo de la nave. Dan 100 puntos al destruirlos,  
    y solo puede haber 3 a la vez. Se repiten cada 4 niveles, habiendo:	  
- Barquitos  
- Doritos  
- Moléculas  
- Cubos/esferas  
    
## 3. Controles  
- Moverse a los lados (A/D, flechas laterales)  
- Disparar (espacio)[con el power-up rojo]  
   
## 4. Posibles añadidos  
1. Modo dos jugadores (estilo Pong) : https://www.youtube.com/watch?v=83uo9QWUW_M&t=307s  
2. Power-ups nuevos:    
- Hacer pequeño  
- Paredes conectadas entre sí  
- Bola que atraviesa en vez de rebotar  
- Etc. (se admiten sugerencias)

    
   




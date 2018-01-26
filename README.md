# Arkanoid Remake
This repository holds an Arkanoid (Taito, 1986) remake. This project is being made at the  
Commputer Science Faculty of the Complutense Unversity of Madrid.  
Authors:

- Raúl Fernández Guardia  
- Ramón Arjona Quiñones

# DESIGN DOCUMENT:
## 1. Description:
  The purpose of the game is to destroy all the bricks wich are above our ship by shooting them with a bouncing ball.  
  Some of them contain power-ups which help us destroy the bricks, and there are also enemies wich appear every ceratin time.

If the ball surpasses the player's defenses, we lose a life.

## 2. Amounts:
**Player:**  move horizontally trying to hit the ball.
  
**Levels:** 36 (we will do as many as we can).  
  
**Lives:** there are 3 at the start of the game, but there is no limt in how many we can get. 
  
**Power ups:** There are 7, and each one provides the player the ability to: [C=cumulative].  
- Navy blue: get wider (C, 2).  
- Red: shoot the bricks.  
- Green: stop the ball for a while.  
- Light blue: triple the ball (C).  
- Gray: gain an extra life (C).  
- Pink: access the next level.  
- Orange: decelerate the ball (C).  
      
**Brick variations:** they add a different amount of score
- White: 50  
- Orange: 60  
- Light blue: 70  
- Green: 80  
- Red: 90  
- Navy blue: 100  
- Pink: 110  
- Yellow: 120  
- Silver: 50xLevel No. (they need 3 hits to be destroyed)  
- Golden: neither add score nor are destroyable  
      
**Enemies:** they die if the ball/player hits them. They move downwards slowly, dissapearing under the player's ship.
    They add 100 points to the score when destroyed, and there can only be 3 of them at a time.  
    They appear cyclically every four levels.  
- Ships 
- Doritos  
- Molecules  
- Cubes/spheres  
    
## 3. Controls  
- Move left and right (A/D, arrow keys)  
- Shoot (spacebar)[red power-up required]  
   
## 4. ADDITIONS  
 ## **Two-player mode**
 Brand new cooperative mode, where both players must help each other in order to destroy all the bricks.
 - The player above, smaller and faster, is able to reach the farthest points of the level in two shakes , but with the downside of being closer to the bricks. Great reflexes required.
 - The player below, bigger and slower, should hit the ball without much needed due to the big body, but you may take your time to move through the level. Better be sure where to stay, or you may regret it later.

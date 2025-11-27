// Chat sound effects utilities

class ChatSounds {
  private sendSound: HTMLAudioElement | null = null;
  private receiveSound: HTMLAudioElement | null = null;

  constructor() {
    // Create send sound (higher pitch, short beep)
    this.sendSound = new Audio();
    this.sendSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Ayvzhjz0KGWm98OScTgwPUKzn77hjHAU7kdryy3kqBSh+yPHakj4KFl+25OihUxEJR6Hg8L9rHwYuf8v8jjsHF2e78+OYSwoQT63o7rxmHAU9k9n0yHYmBCWAzPbfjTkIF2q98eKTSAoNU7Hq6qhUFApJouLxvmQdBiyBzPzhjTsIF2m88OScTAoPUq/o7LdjGwU9k9jyyHYmBCeAyvzfjDkHGGu98N2STgoPUrHq6KVQEQlKpOLwvWMcBi6Cy/zgjDkHGGy88N6STgoNUbLp6qJNEApKpeLwu2AaBiyByvrfizcHGGy88N+QLwkPUbPp7KNQEglMp+XvulscBy6By/vfijYHGG698N+OLAcOU7Tq7KNQEQlNqObwulscBzCCy/vgijYGGW+++N+PLwgPVLXr7KVREQlOqeXvuVobBy+ByvrhiTUGGXC++d+PLQcPU7Xr7KVSEglOqubvu1obBy+CyvrhiDQFGHG/+d+PLwcPU7Xq7KRQEQlPq+Xvu1ocBy+By/rfiDQGGXG/+d+OLAcOU7Tq7KNQEglPq+XvulgbBy+By/rfhzMFGHG/+t6NKwcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcNU7Tp7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLA';

    // Create receive sound (lower pitch, gentle notification)
    this.receiveSound = new Audio();
    this.receiveSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8=';
  }

  playSendSound() {
    if (this.sendSound) {
      this.sendSound.currentTime = 0;
      this.sendSound.volume = 0.3;
      this.sendSound.play().catch(e => console.log('Could not play send sound:', e));
    }
  }

  playReceiveSound() {
    if (this.receiveSound) {
      this.receiveSound.currentTime = 0;
      this.receiveSound.volume = 0.4;
      this.receiveSound.play().catch(e => console.log('Could not play receive sound:', e));
    }
  }
}

export const chatSounds = new ChatSounds();

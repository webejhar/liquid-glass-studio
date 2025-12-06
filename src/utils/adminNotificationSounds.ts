// Admin notification sound effects

class AdminNotificationSounds {
  private orderSound: HTMLAudioElement | null = null;
  private ticketSound: HTMLAudioElement | null = null;
  private registrationSound: HTMLAudioElement | null = null;
  private generalSound: HTMLAudioElement | null = null;

  constructor() {
    // Order notification sound - cash register style
    this.orderSound = new Audio();
    this.orderSound.src = 'data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTtvAACAgIGCg4SGh4mKjI2PkZKUlpeZmZmYlpOQjYqHhIKAgIGChYeLjpGUl5qcnp+fnZqXk5CKhoSCgoOFh4qNkJOWmZudn5+em5mVko6LiIaFhYaHiYuNkJKVl5mcnZ2cm5mXk5CMinl4enx/goWIi46RlJaYmpmamZiVko6LiYaFhISFh4iKjI6QkpSWl5iZmZiXlZKQjYuJh4aGhoaHiImLjI6PkZOVlpeYmJiXlpSTkI6MioiHh4aGh4iJiouMjo+RkpSVlpemtb7FysrFu62elIqEhYuTnqq1vcPHx8O8taqdko2KioxtttzGtrKxsbO2u8LD';

    // Support ticket notification - alert style
    this.ticketSound = new Audio();
    this.ticketSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Ayvzhjz0KGWm98OScTgwPUKzn77hjHAU7kdryy3kqBSh+yPHakj4KFl+25OihUxEJR6Hg8L9rHwYuf8v8jjsHF2e78+OYSwoQT63o7rxmHAU9k9n0yHYmBCWAzPbfjTkIF2q98eKTSAoNU7Hq6qhUFApJouLxvmQdBiyBzPzhjTsIF2m88OScTAoPUq/o7LdjGwU9k9jyyHYmBCeAyvzfjDkHGGu98N2STgoPUrHq6KVQEQlKpOLwvWMcBi6Cy/zgjDkHGGy88N6STgoNUbLp6qJNEApKpeLwu2AaBiyByvrfizcHGGy88N+QLwkPUbPp7KNQEglMp+XvulscBy6By/vfijYHGG698N+OLAcOU7Tq7KNQEQlNqObwulscBzCCy/vgijYGGW+++N+PLwgPVLXr7KVREQlOqeXvuVobBy+ByvrhiTUGGXC++d+PLQcPU7Xr7KVSEglOqubvu1obBy+CyvrhiDQFGHG/+d+PLwcPU7Xq7KRQEQlPq+Xvu1ocBy+By/rfiDQGGXG/+d+OLAcOU7Tq7KNQEglPq+XvulgbBy+By/rfhzMFGHG/+t6NKwcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcNU7Tp7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLAcOU7Tq7KRSEglPq+XvulgbBy+CyvrhiDQGGXG/+t+OLA';

    // Registration notification - welcome chime
    this.registrationSound = new Audio();
    this.registrationSound.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/wABAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8AAgMEBQYHCAkKCwwNDg8QERITFBUWFxgZGhscHR4fICEiIyQlJicoKSorLC0uLzAxMjM0NTY3ODk6Ozw9Pj9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpbXF1eX2BhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ent8fX5/gIGCg4SFhoeIiYqLjI2Oj5CRkpOUlZaXmJmam5ydnp+goaKjpKWmp6ipqqusra6vsLGys7S1tre4ubq7vL2+v8DBwsPExcbHyMnKy8zNzs/Q0dLT1NXW19jZ2tvc3d7f4OHi4+Tl5ufo6err7O3u7/Dx8vP09fb3+Pn6+/z9/v8=';

    // General notification sound
    this.generalSound = new Audio();
    this.generalSound.src = 'data:audio/wav;base64,UklGRl9vAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTtvAACAgIKEhoiKjI6QkpSWmJqcnp6enJqYlpSSkI6MioiGhIOCgoKDhIWHiImLjI6PkJGSk5SUlJSTkpGQj46NjIuKiYiHhoWFhISDg4ODg4SEhYaHiImKi4yNjo+QkZGRkZCQj46NjYyLioqJiIiHh4aGhoaGhoaHh4eIiImJiouLjIyNjY6Ojo6OjY2NjIyLi4qKiomJiYmIiIiIiIiIiImJiYqKiouLjIyMjY2NjY2NjY2MjIyLi4uKioqKiomJiYmJiYmJiYqKioqLi4uLjIyMjIyMjIyMjIyLi4uLi4qKioqKioqJiYmJiYmJiYqKioqKi4uLi4uMjIyMjIyMjIyMjIuLi4uLioqKioqKiomJiYmJiYmJioqKioqLi4uLi4yMjIyMjIyMjIyMi4uLi4uKioqKioqKiYmJiYmJiYmKioqKiouLi4uLjIyMjIyMjIyMjIyLi4uLi4qKioqKioqJiYmJiYk=';
  }

  playOrderSound() {
    if (this.orderSound) {
      this.orderSound.currentTime = 0;
      this.orderSound.volume = 0.5;
      this.orderSound.play().catch(e => console.log('Could not play order sound:', e));
    }
  }

  playTicketSound() {
    if (this.ticketSound) {
      this.ticketSound.currentTime = 0;
      this.ticketSound.volume = 0.5;
      this.ticketSound.play().catch(e => console.log('Could not play ticket sound:', e));
    }
  }

  playRegistrationSound() {
    if (this.registrationSound) {
      this.registrationSound.currentTime = 0;
      this.registrationSound.volume = 0.4;
      this.registrationSound.play().catch(e => console.log('Could not play registration sound:', e));
    }
  }

  playGeneralSound() {
    if (this.generalSound) {
      this.generalSound.currentTime = 0;
      this.generalSound.volume = 0.4;
      this.generalSound.play().catch(e => console.log('Could not play general sound:', e));
    }
  }

  playByType(type: string) {
    switch (type) {
      case 'product_order':
      case 'domain_order':
        this.playOrderSound();
        break;
      case 'support_ticket':
        this.playTicketSound();
        break;
      case 'user_registration':
        this.playRegistrationSound();
        break;
      default:
        this.playGeneralSound();
    }
  }
}

export const adminNotificationSounds = new AdminNotificationSounds();

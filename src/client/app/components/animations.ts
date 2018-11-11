import {
    trigger, animateChild, group, 
    transition, animate, style, query
  } from '@angular/animations';
    
  // Routable animations
  export const fadeInAnimation =
    trigger('routeAnimations', [
      transition('Rundenliste => Runde', [        
        group([
          query(':leave', [
            animate(500, style({opacity: 0}))
          ]),
          query(':enter', [
            animate(500, style({opacity: 1}))
          ])
        ])
      ]),
      // transition('Runde => Rundenliste', [        
      //   group([
      //     query(':leave', [
      //       animate(500, style({opacity: 0}))
      //     ]),
      //     query(':enter', [
      //       animate(500, style({opacity: 1}))
      //     ])
      //   ])
      // ])
    ]);

  
import {
    trigger, animateChild, group, 
    transition, animate, style, query
  } from '@angular/animations';
    
  // Routable animations
  export const fadeInAnimation =
    trigger('routeAnimations', [
      transition('Rundenliste <=> Runde', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%'
          })
        ]),
        // query(':enter', [
        //   // style({ top: '-100%'})
        // ]),
        // query(':leave', animateChild()),
        group([
          query(':leave', [
            animate(300, style({opacity: 0}))
          ]),
          query(':enter', [
            animate(300, style({opacity: 1}))
          ])
        ]),
        // query(':enter', animateChild()),
      ])
    ]);

  
import {
    trigger, animateChild, group, 
    transition, animate, style, query
  } from '@angular/animations';
    
  // Routable animations
  export const fadeInAnimation =
    trigger('routeAnimations', [
      // transition('Rundenliste => Runde', [        
      //   group([
      //     query(':leave', [
      //       animate(500, style({opacity: 0}))
      //     ]),
      //     query(':enter', [
      //       animate(500, style({opacity: 1}))
      //     ])
      //   ])
      // ]),
      transition('Rundenliste => Runde', [
        query(':enter, :leave', style({ position: 'fixed', width:'100%' })
          , { optional: true }),
        group([
          query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(100%)' }))
          ], { optional: true }),
        ])
      ]),
      transition('* => Rundenliste', [
        group([
          query(':enter, :leave', style({ position: 'fixed', width:'100%' })
          , { optional: true }),
          query(':enter', [
            style({ transform: 'translateX(100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' }))
          ], { optional: true }),
        ])
      ]),
      transition('* => Charts', [
        group([
          query(':enter, :leave', style({ position: 'fixed', width:'100%' })
          , { optional: true }),
          query(':enter', [
            style({ transform: 'translateX(100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(-100%)' }))
          ], { optional: true }),
        ])
      ]),
      transition('* => *', [
        query(':enter, :leave', style({ position: 'fixed', width:'100%' })
          , { optional: true }),
        group([
          query(':enter', [
            style({ transform: 'translateX(-100%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(0%)' }))
          ], { optional: true }),
          query(':leave', [
            style({ transform: 'translateX(0%)' }),
            animate('0.5s ease-in-out', style({ transform: 'translateX(100%)' }))
          ], { optional: true }),
        ])
      ]),
      // transition('Runde => Charts', [        
      //   group([
      //     query(':leave', [
      //       animate(500, style({opacity: 0}))
      //     ]),
      //     query(':enter', [
      //       animate(500, style({opacity: 1}))
      //     ])
      //   ])
      // ]),
      // transition('Charts => Rundenliste', [        
      //   group([
      //     query(':leave', [
      //       animate(500, style({opacity: 0}))
      //     ]),
      //     query(':enter', [
      //       animate(500, style({opacity: 1}))
      //     ])
      //   ])
      // ]),
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

  
import {
    trigger, animateChild, group, 
    transition, animate, style, query
  } from '@angular/animations';
    
  const swipeDuration = "0.5s";
  
  const swipeLeft = [
    query(':enter, :leave', style({ position: 'fixed', width:'100%' }), { optional: true }),
    group([
      query(':enter', [
        style({ transform: 'translateX(-100%)' }), animate(`${swipeDuration} ease-in-out`, style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
        style({ transform: 'translateX(0%)' }), animate(`${swipeDuration} ease-in-out`, style({ transform: 'translateX(100%)' }))
      ], { optional: true }),
    ])
  ];
  const swipeRight = [
    group([
      query(':enter, :leave', style({ position: 'fixed', width:'100%' }), { optional: true }),
      query(':enter', [
        style({ transform: 'translateX(100%)' }), animate(`${swipeDuration} ease-in-out`, style({ transform: 'translateX(0%)' }))
      ], { optional: true }),
      query(':leave', [
        style({ transform: 'translateX(0%)' }), animate(`${swipeDuration} ease-in-out`, style({ transform: 'translateX(-100%)' }))
      ], { optional: true }),
    ])
  ];
  const slideInOut = [
    group([
      query(':enter, :leave', style({ position: 'fixed', width:'100%', opacity: 1 }), { optional: true }),
      query(':enter', [
        animate(swipeDuration, style({transform: 'translate3d(0, 0, 0)', offset: 0})),
        animate(swipeDuration, style({transform: 'translate3d(-150%, 0, 0)', opacity: 0, offset: 1})),
      ], { optional: true }),
      query(':leave', [
        animate(500, style({opacity: 0}))
      ])
      // query(':leave', [
      //   animate(swipeDuration, style({transform: 'translate3d(0, 0, 0)', offset: 0})),
      //   animate(swipeDuration, style({transform: 'translate3d(-150%, 0, 0)', opacity: 0, offset: 1})),
      // ], { optional: true }),
    ])
  ];

  // Routable animations
  export const fadeInAnimation =
    trigger('routeAnimations', [      
      // transition('* => *', slideInOut),
      transition('Rundenliste => Runde', swipeRight),
      transition('* => Rundenliste', swipeLeft),      
    ]);

  
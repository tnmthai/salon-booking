/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // The type scale was Tailwind's default, which bottoms out at 12px for
      // `text-xs` — and `text-xs` is used 219 times across the app, much of it
      // for real body text rather than captions. On a phone, in a salon, that
      // is too small for a lot of people. Every step is nudged up and given
      // more line-height; combined with the larger root size set in index.css
      // it lands roughly 15-20% bigger on mobile without touching 219 call
      // sites by hand.
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.15rem' }],   // 13px
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],    // 15px
        base: ['1.0625rem', { lineHeight: '1.6rem' }],  // 17px
        lg: ['1.1875rem', { lineHeight: '1.75rem' }],   // 19px
        xl: ['1.3125rem', { lineHeight: '1.85rem' }],   // 21px
      },
    },
  },
  plugins: [],
}

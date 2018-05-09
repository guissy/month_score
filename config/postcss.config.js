const NODE_ENV = process.env.NODE_ENV,

// Transfer @import rule by inlining content, e.g. @import 'normalize.css'
// https://github.com/postcss/postcss-import
postcssImport = require('postcss-import')(),

// Convert CSS shorthand filters to SVG equivalent, e.g. .blur { filter: blur(4px); }
// https://github.com/iamvdo/pleeease-filters
filters = require('pleeease-filters')(),

// W3C CSS Level4 :matches() pseudo class, e.g. p:matches(:first-child, .special) { }
// https://github.com/postcss/postcss-selector-matches
matches = require('postcss-selector-matches')(),

// Transforms :not() W3C CSS Level 4 pseudo class to :not() CSS Level 3 selectors
// https://github.com/postcss/postcss-selector-not
selectorNot = require('postcss-selector-not')(),

// Postcss flexbox bug fixer
// https://github.com/luisrudge/postcss-flexbugs-fixes
flexbugsFixes = require('postcss-flexbugs-fixes')(),

// Add vendor prefixes to CSS rules using values from caniuse.com
// https://github.com/postcss/autoprefixer
autoprefixer = require('autoprefixer')([]),

// PreCSS is a tool that allows you to use Sass-like markup in your CSS files
// https://github.com/jonathantneal/precss
precss = require('precss')({ /* options */ }),

// PostCSS plugin to use tomorrow's CSS syntax, today. http://cssnext.io/
//  https://github.com/MoOx/postcss-cssnext/
cssnext = require('postcss-cssnext')(),

// keep rules and at-rules content in order
// https://github.com/hudochenkov/postcss-sorting
sorting = require('postcss-sorting')({
  'order': [
    'custom-properties',
    'dollar-variables',
    'declarations',
    'at-rules',
    'rules'
  ],
  'properties-order': 'alphabetical',
  'unspecified-properties-position': 'bottom'
})

// A modular minifier, built on top of the PostCSS ecosystem. http://cssnano.co
// https://github.com/ben-eb/cssnano
// cssnano = require('cssnano')({
//   preset: 'default',
// });


module.exports = () => {
  if (NODE_ENV)
  return {
      plugins: [
        postcssImport,
        filters,
        matches,
        selectorNot,
        flexbugsFixes,
        precss,
        cssnext,
        sorting
      ]
    }
  else
    return {
      plugins: [
          postcssImport,
          filters,
          matches,
          selectorNot,
          flexbugsFixes,
          autoprefixer,
          precss,
          cssnext,
          sorting
        ]
    }
}

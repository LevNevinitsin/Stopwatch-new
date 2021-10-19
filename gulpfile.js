const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const del = require("del");
const sync = require("browser-sync").create();

// Styles
const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// HTML
const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("build"));
}

// Scripts
const scripts = () => {
  return gulp.src([
      "source/js/**/*.js",
      "!source/js/worker.js"
    ])
    .pipe(sourcemap.init())
    .pipe(concat("script.min.js"))
    .pipe(uglify())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.scripts = scripts

// Images
// const optimizeImages = () => {
//   return gulp.src([
//     "source/img/**/*.{png,jpg,svg}",
//     "!source/img/**/inline*.svg"
//   ])
//     .pipe(imagemin([
//       imagemin.mozjpeg({ quality: 75, progressive: true }),
//       pngquant({
//         quality: [0.3, 0.5],
//         speed: 1
//       }),
//       imagemin.svgo()
//     ]))
//     .pipe(gulp.dest("build/img"));
// }

// exports.optimizeImages = optimizeImages;

// WebP
// const createWebp = () => {
//   return gulp.src("source/img/**/*.{jpg,png}")
//     .pipe(webp({ quality: 75 }))
//     .pipe(gulp.dest("build/img"));
// }

// exports.createWebp = createWebp;

// Sprite
// const createSprite = () => {
//   return gulp.src("source/img/**/inline*.svg")
//     .pipe(imagemin([
//       imagemin.svgo({
//         plugins: [{
//           removeViewBox: false
//         }]
//       })
//     ]))
//     .pipe(svgstore())
//     .pipe(rename("sprite.svg"))
//     .pipe(gulp.dest("build/img"));
// }

// exports.createSprite = createSprite;

// Copy
const copy = (done) => {
  gulp.src([
    "source/js/worker.js",
    "source/fonts/*.{woff2,woff}",
    "source/*.ico",
    "source/img/**/*.{jpg,png,svg}",
    "source/audio/**/*.{wav, mp3}",
    "!source/img/**/inline*.svg"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// Clean
const clean = () => {
  return del("build");
}

// Server
const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload
const reload = (done) => {
  sync.reload();
  done();
}

// Watcher
// Watcher
const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series(styles));
  gulp.watch("source/js/**/*.js", gulp.series(scripts));
  gulp.watch("source/js/worker.js", gulp.series(
    clean,
    gulp.parallel(
      styles,
      html,
      scripts,
      copy
    )
  ));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

// Build
const build = gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    scripts,
    copy
  )
);

exports.build = build

// Default
exports.default = gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    scripts,
    copy
  ),
  server,
  watcher
);

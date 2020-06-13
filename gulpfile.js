import gulp from 'gulp';
import htmlmin from 'gulp-htmlmin';
import posthtml from 'gulp-posthtml';
import include from 'posthtml-include';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import pimport from 'postcss-import';
import babel from 'gulp-babel';
import terser from 'gulp-terser';
import del from 'del';
import sync from 'browser-sync';
import imagemin from 'gulp-imagemin';
import gwebp from 'gulp-webp';
import svgstore from 'gulp-svgstore';
import rename from 'gulp-rename';

// HTML

export const html = () => {
  return gulp.src('src/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(sync.stream());
};

// Styles

export const styles = () => {
  return gulp.src('src/styles/index.scss', { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer,
      pimport,
      csso,
    ]))
    .pipe(gulp.dest('build/styles', { sourcemaps: '.' }))
    .pipe(sync.stream());
};

// Scripts

export const scripts = () => {
  return gulp.src('src/scripts/index.js', { sourcemaps: true })
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(terser())
    .pipe(gulp.dest('build/scripts/', { sourcemaps: '.' }))
    .pipe(sync.stream());
};

// Copy

export const copy = () => {
  return gulp.src([
    'src/fonts/**/*',
    'src/images/**/*',
    'src/*.ico',
  ], {
    base: 'src'
  })
    .pipe(gulp.dest('build'))
    .pipe(sync.stream({
      once: true
    }));
}

// Server

export const server = () => {
  sync.init({
    server: 'build/',
    ui: false,
    notify: false
  });
};

// Watch

export const watch = () => {
  gulp.watch('src/*.html', html);
  gulp.watch('src/styles/**/*.scss', styles);
  gulp.watch('src/scripts/**/*.js', scripts);
  gulp.watch([
    'src/fonts/**/*',
    'src/images/**/*',
  ], copy);
  gulp.watch('src/images/{icon-*,logo-*}.svg', gulp.series(sprite, html));
};

// Clean

export const clean = () => del('build');

// Sprite from icon and logo svg

export const sprite = () => {
  return gulp.src('src/images/{icon-*,logo-*}.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/images'));
};

// Images optimization

export const images = () => {
  return gulp.src('build/images/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ progressive: true, quality: 80 }),
      imagemin.svgo(),
    ]))
    .pipe(gulp.dest('build/images'))
};

// Webp from images

export const webp = () => {
  return gulp.src('build/images/**/*.{png,jpg}')
    .pipe(gwebp({ quality: 90 }))
    .pipe(gulp.dest('build/images'))
};

// Image processing

export const imgproc = gulp.parallel(
  images,
  webp
);

// Build

export const build = gulp.series(
  clean,
  sprite,
  gulp.parallel(
    html,
    styles,
    scripts,
    copy,
  ),
);

// Default

export default gulp.series(
  build,
  gulp.parallel(
    watch,
    server,
  ),
);

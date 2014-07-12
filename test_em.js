// K-Means & EM Clustering
// (c) 2010 chris@jormungand.net


// v2 and m22 are 2d vectors and matrices.
// We define some basic linear algebra operations here.

function v2_rand() { return [1-2*Math.random(), 1-2*Math.random()]; }
function v2_zero() { return [0,0]; }
function v2_add_v2(a,b) { return [a[0]+b[0],a[1]+b[1]]; }
function v2_addto_v2(a,b) { b[0] += a[0]; b[1] += a[1]; }
function v2_sub_v2(a,b) { return [a[0]-b[0],a[1]-b[1]]; }
function v2_dot_v2(a,b) { return a[0]*b[0]+a[1]*b[1]; }
function v2_len(a) { return Math.sqrt(a[0]*a[0]+a[1]*a[1]); }
function v2_dist_v2(a,b) {
  var dx = a[0]-b[0];
  var dy = a[1]-b[1];
  return Math.sqrt(dx*dx+dy*dy);
}

// 2x2 matrix stored in a 4-element array, column major.
// [ 0 2 ]
// [ 1 3 ]

function m22_ident() { return [1, 0, 0, 1]; }

function v2_mul_m22(v,m) { return [v[0]*m[0]+v[1]*m[2], v[0]*m[1]+v[1]*m[3]]; }

function m22_mul_m22(m,n) {
  return [m[0]*n[0]+m[1]*n[2],
          m[0]*n[1]+m[1]*n[3],
          m[2]*n[0]+m[3]*n[2],
          m[2]*n[1]+m[3]*n[3]];
}
function m22_transpose(m) { return [m[0], m[2], m[1], m[3]]; }

function m22_det(m) { return m[0]*m[3]-m[1]*m[2]; }

function m22_invert(m) {
  var d = m22_det(m);
  return [m[3]/d, -m[1]/d, -m[2]/d, m[0]/d];
}

// 2x2 Cholesky Decomposition.  A trick for drawing ellipses
function m22_chol(m) {
  var sra = Math.sqrt(m[0]);
  return [sra,0,m[1]/sra,Math.sqrt(m[3]-m[1]*m[1]/m[0])];
}

function random_squares(n,m) {
  var out = [];
  for(var ii = 0; ii < n; ++ii) {
    var x = 1.5*(Math.random()-0.5);
    var y = 1.5*(Math.random()-0.5);
    for(var jj = 0; jj < m; ++jj) {
      var dx = 0.5*(Math.random()-0.5)
      var dy = 0.5*(Math.random()-0.5)
      out.push([x+dx,y+dy]);
    }
  }
  return out;
}

var image = [ "..........",
              ".xxx......",
              ".x........",
              ".xxx......",
              ".x........",
              ".xxx......",
              "....xxxxx.",
              "....x.x.x.",
              "....x.x.x.",
              ".........."];

function draw_image(img) {
  var out = [];
  var xr = 2/img.length;
  var yr = 2/img[0].length;
  for(var ii = 0; ii < img.length; ++ii) {
    var y0 = 1-2*ii/img.length;
    for(var jj = 0; jj < img[ii].length; ++jj) {
      if (img[ii][jj] != '.') {
        var x0 = -1+2*jj/img[ii].length;
        for(var kk = 0; kk < 10; ++kk) {
          out.push([x0+xr*Math.random(), y0+yr*Math.random()]);
        }
      }
    }
  }
  return out;
}

// kmeans_update_means()
//   set each means[m] to be the avg of all data[x] such that labels[x] = m.
//   in other words, compute the average of all values with each label.
function kmeans_update_means(data,means,labels) {
  // pre: labels[dd] = 0 .. means.length-1
  // pre: data[dd] = [x,y]
  // post: means[dd] = [.., ..]
  var counts = [];
  for(var mm = 0; mm < means.length; ++mm) {
    means[mm] = [0,0];
    counts[mm] = 0;
  }
  for(var dd = 0; dd < data.length; ++dd) {
    var l = labels[dd];
    means[l][0] += data[dd][0];
    means[l][1] += data[dd][1];
    counts[l]++;
  }
  for(var mm = 0; mm < means.length; ++mm) {
    if(counts[mm] != 0) {
      means[mm][0] /= counts[mm];
      means[mm][1] /= counts[mm];
    } else {
      // assign it at random.
      var r = Math.floor(Math.random()*data.length);
      means[mm] = [data[r][0], data[r][1]];
    }
    // or it was empty.  shucks.
  }
}

// kmeans_update_labels()
//   set each labels[d] to m which minimizes dist(data[d], means[m])
//   in other words, assign each data point to its nearest mean.
//   returns whether any label was changed.
function kmeans_update_labels(data,means,labels) {
  var modified = false;
  for(var dd = 0; dd < data.length; ++dd) {
    var min_mm = 0;
    var min_dist = v2_dist_v2(data[dd], means[0]);
    for(var mm = 1; mm < means.length; ++mm) {
      var dist = v2_dist_v2(data[dd], means[mm]);
      if (dist < min_dist) {
        min_dist = dist;
        min_mm = mm;
      }
    }
    if(labels[dd] != min_mm) {
      modified = true;
    }
    labels[dd] = min_mm;
  }
  return modified;
}

function em_init(data, labelvecs, classes) {
  labelvecs.length = data.length;
  for(var dd = 0; dd < data.length; ++dd) {
    labelvecs[dd] = [];
    for(var cc = 0; cc < classes.length; ++cc) {
      labelvecs[dd][cc] = 1.0 / classes.length;
    }
  }
  var s = 0.2;
  for(var cc = 0; cc < classes.length; ++cc) {
    classes[cc] = [];
    classes[cc][0] = v2_rand();
    classes[cc][1] = [s, 0, 0, s];
  }
}

function em_prep(data, labelvecs, classes) {
  for(var dd = labelvecs.length; dd < data.length; ++dd) {
    labelvecs[dd] = [];
    for(var cc = 0; cc < classes.length; ++cc) {
      labelvecs[dd][cc] = 1.0 / classes.length;
    }
  }
  labelvecs.length = data.length;
  var s = 0.2;
  for(var cc = 0; cc < classes.length; ++cc) {
    if(classes[cc]) {
      continue;
    }
    classes[cc] = [];
    classes[cc][0] = v2_rand();
    classes[cc][1] = [s, 0, 0, s];
  }
}

function em_expect(data, labelvecs, classes) {
  // data: array of v2 points
  // labelvecs: probabilistic assignment of data to classes
  // classes: each is a [v2, m22]

  // This is described in:
  // http://en.wikipedia.org/wiki/Multivariate_normal_distribution
  //
  // For every class..
  for(var cc = 0; cc < classes.length; ++cc) {
    // ..compute fixed parameters of probability density function..
    var inv_cov = m22_invert(classes[cc][1]);
    var d = Math.pow(m22_det(classes[cc][1]), -0.5);
    // ..and for every datum..
    for(var dd = 0; dd < data.length; ++dd) {
      var rel = v2_sub_v2(data[dd], classes[cc][0]);
      // ..compute its probability.
      var p = d*Math.exp(-0.5*v2_dot_v2(v2_mul_m22(rel, inv_cov), rel));
      labelvecs[dd][cc] = p;
    }
  }

  // Now normalize so each datum has probability 1.0.
  // Also label each one as its current most likely class.
  for(var dd = 0; dd < data.length; ++dd) {
    var sum = 0;
    var max = 0;
    var maxcc = 0;
    for(var cc = 0; cc < classes.length; ++cc) {
      sum += labelvecs[dd][cc];
      if (labelvecs[dd][cc] > max) {
        max = labelvecs[dd][cc];
        maxcc = cc;
      }
    }
    labels[dd] = maxcc;
    for(var cc = 0; cc < classes.length; ++cc) {
      labelvecs[dd][cc] /= sum;
    }
  }
}

function em_maximize(data, labelvecs, classes) {
  for(var cc = 0; cc < classes.length; ++cc) {
    var sum = [0,0];
    var num = 0;
    for(var dd = 0; dd < data.length; ++dd) {
      var p = labelvecs[dd][cc];
      sum[0] += p * data[dd][0];
      sum[1] += p * data[dd][1];
      num += p;
    }

    var mean = [sum[0]/num, sum[1]/num];
    var xx = 0, yy = 0, xy = 0;
    for(var dd = 0; dd < data.length; ++dd) {
      var p = labelvecs[dd][cc];
      var rel = v2_sub_v2(data[dd], mean);
      xx += rel[0]*rel[0] * p;
      xy += rel[0]*rel[1] * p;
      yy += rel[1]*rel[1] * p;

    }
    xx /= num;
    xy /= num;
    yy /= num;

    var cov = [xx, xy, xy, yy];

    classes[cc][0] = mean;
    classes[cc][1] = cov;
  }
}

// Data to be clustered. Each element is [x,y] in (-1:1).
var data = [];
// Labels for each datum.  Integers < colors.length.
var labels = [];
var nclasses = 2;

// Stuff for k-means:
// Each element is an [x,y] mean for the corresponding class.
var means = [];

// Stuff for EM.
// Each element is a size-nclasses array of probs st. sum(..)=1.
var em_labelvecs = [];
// Each element is a [mean, covariance] pair.  (v2, m22).
var em_classes = [];


// 0: none, 1: kmeans, 2: em.
var mode = 0;

function cluster_init() {
  if (nclasses < 1) nclasses = 1;

  // Resize labels to data and assign invalid labels randomly.
  labels.length = data.length;
  for(var ll = 0; ll < labels.length; ++ll) {
    if (labels[ll] == null || labels[ll] < 0 || labels[ll] >= nclasses) {
      labels[ll] = Math.floor(Math.random(nclasses));
    }
  }

  means.length = nclasses;
  // Compute the mean of each existing class.
  kmeans_update_means(data, means, labels);

  em_classes.length = nclasses;
  // Calculate the gaussian of each existing class.

  em_prep(data, em_labelvecs, em_classes, labels);
  //em_init(data, em_labelvecs, em_classes, labels);

  //em_maximize(data, em_labelvecs, em_classes);
}

//cluster_init();

function cluster_update() {
  if(mode == 1) {
    kmeans_update_means(data,means,labels);
    if(!kmeans_update_labels(data,means,labels)) {
      animate = 0;
    }
  } else if (mode == 2) {
    em_expect(data, em_labelvecs, em_classes);
    em_maximize(data, em_labelvecs, em_classes);
    for(var dd = 0; dd < data.length; ++dd) {
      var max_p = 0;
      var max_cc = 0;
      for(var cc = 0; cc < em_classes.length; ++cc) {
        if (em_labelvecs[dd][cc] > max_p) {
          max_p = em_labelvecs[dd][cc];
          max_cc = cc;
        }
      }
      labels[dd] = max_cc;
    }
  }
}

if(module.parent == null) {

  data = draw_image(image);
  nclasses = 2;
  mode = 2;

  cluster_init();

  for(var ii = 0; ii < 5; ++ii) {
    cluster_update();
    // console.log(em_classes);
    // console.log(em_labelvecs);
    console.log(data.length);
  }


}

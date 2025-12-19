'use strict';
let fs = require('fs'),
    path = require('path'),
    fm = require('hexo-front-matter');

// Use in-memory object to store projects,
// downside is hexo server must be restarted to update
const projectsListing = [];

// Load projects from source/_projects/*.md (file-based projects)
function loadFolderProjects(ctx, baseDir) {
    if (projectsListing.length)
        return projectsListing; // already loaded

    // Check if source/_projects exists
    const base = path.join(baseDir || ctx.base_dir, 'source', '_projects');
    if (!fs.existsSync(base))
        return [];

    // Read all Markdown files
    const entries = fs.readdirSync(base, { withFileTypes: true }),
        mdFiles = entries
            .filter(entry => entry.isFile())
            .map(entry => entry.name)
            .filter(name => /\.(md|markdown)$/i.test(name));

    // Parse each file, and add it to the projects array
    mdFiles.forEach(filename => {
        const full = path.join(base, filename);
        let raw;
        try {
            raw = fs.readFileSync(full, 'utf8');
        } catch (err) {
            ctx.log.error('[theme_projects] Failed to read project file:', full);
            ctx.log.error(err);
            return;
        }

        let parsed;
        try {
            parsed = fm.parse(raw);
        } catch (err) {
            ctx.log.error('[theme_projects] Failed to parse front matter for:', full);
            ctx.log.error(err);
            return;
        }

        // Build the project object
        const body = parsed._content || '',
            content = parsed._content,
            slug = parsed.slug || filename.replace(/\.(md|markdown)$/i, ''),
            stat = fs.statSync(full),
            date = parsed.date ? new Date(parsed.date) : stat.mtime;

        // Render the markdown
        let rendered = '';
        try {
            rendered = ctx.render.renderSync({
                text: body,
                engine: 'markdown',
                path: full // helps some renderers with relative paths
            });
        } catch (err) {
            ctx.log.error('[theme_projects] Failed to render markdown for:', full);
            ctx.log.error(err);
            rendered = body; // fallback: raw markdown if render fails
        }

        // Add the project to the projects array
        projectsListing.push({
            source: full,
            type: 'file',
            slug,
            path: `projects/${slug}/`,
            title: parsed.title || slug,
            date,
            password: parsed.password || '',
            project_url: parsed.project_url || '',
            project_summary: parsed.project_summary || '',
            project_tags: parsed.project_tags || parsed.tags || [],
            content_raw: content,
            content: rendered,
            raw: parsed
        });
    });

    // Sort projects by date
    projectsListing.sort(function (a, b) { return b.date - a.date; });

    // Sort projects by date
    return projectsListing;
}

// Generator: /projects + paginated pages + project detail pages
hexo.extend.generator.register('theme_projects', function (locals) {
    const theme = this.theme.config || {},
        projCfg = theme.projects || {},
        title = projCfg.title || 'Projects'; // Projects title, defaults to "Projects", not currently used

    // Load all projects
    let allProjects = loadFolderProjects(this, hexo.base_dir);
    if (!allProjects.length)
        return [];

    // Paginated listing of projects + project detail pages
    const config = this.config || {},
        perPage =
            projCfg.per_page ||
            (config.index_generator && config.index_generator.per_page) ||
            config.per_page ||
            10,
        total = allProjects.length,
        totalPages = perPage > 0 ? Math.ceil(total / perPage) : 1,
        routes = [];

    // Paginated listing: /projects/, /projects/page/2/, ...
    for (let i = 1; i <= totalPages; i++) {
        const current = i,
            listPath =
                current === 1
                    ? 'projects/index.html'
                    : `projects/page/${current}/index.html`,
            start = perPage > 0 ? perPage * (current - 1) : 0,
            end = perPage > 0 ? start + perPage : total,
            pageProjects = allProjects.slice(start, end),
            prev = current > 1 ? current - 1 : 0,
            next = current < totalPages ? current + 1 : 0,
            prev_link =
                prev > 0
                    ? (prev === 1 ? 'projects/' : `projects/page/${prev}/`)
                    : '',
            next_link =
                next > 0
                    ? `projects/page/${next}/`
                    : '';

        // Add route to collection
        routes.push({
            path: listPath,
            layout: 'projects',
            data: {
                title,
                projects: pageProjects,
                current,
                total: totalPages,
                prev,
                next,
                prev_link,
                next_link
            }
        });
    }

    // Detail pages for _projects folder entries
    allProjects.forEach(project => {
        routes.push({
            path: project.path,
            layout: 'project',
            data: {
                title: project.title,
                project
            }
        });
    });

    return routes;
});

// Get a list of recent projects for the sidebar
hexo.extend.helper.register('recent_projects', function (limit) {
    const ctx = this,
        themeCfg = ctx.theme.config || {},
        sidebarCfg = themeCfg.sidebar && themeCfg.sidebar.recent_projects || {},
        enabled = sidebarCfg.enabled !== false;

    // If called from sidebar and it's disabled, respect that
    if (!enabled && !limit)
        return [];

    // Load all projects
    const all = loadFolderProjects(ctx, hexo.base_dir);
    if (!all.length)
        return [];

    // Return "limit" items
    return all.slice(0, limit || sidebarCfg.limit || 5);
});
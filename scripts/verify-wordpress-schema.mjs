const endpoint = process.env.WORDPRESS_GRAPHQL_URL || "https://cms.saifulshuvo.com/graphql";

const query = `
  query SaifulShuvoBuildContract {
    siteSettings {
      siteSettingsFields {
        ownerName
        heroHeading
        showProjects
        seoDefaultTitle
        analyticsProvider
      }
    }
    projects(first: 2) {
      nodes {
        slug
        title
        projectFields { summary projectState featured sortOrder }
        projectCategories(first: 2) { nodes { slug name } }
        technologies(first: 5) { nodes { slug name } }
      }
    }
    skills(first: 2) {
      nodes {
        title
        skillFields { proficiencyLabel proficiencyLevel active sortOrder }
        skillGroups(first: 2) { nodes { slug name skillGroupFields { icon accent active featured sortOrder } } }
      }
    }
    experiences(first: 2) { nodes { title experienceFields { organization active sortOrder } } }
    services(first: 2) { nodes { title serviceFields { icon accent active sortOrder } } }
    posts(first: 2) { nodes { slug title seoFields { seoTitle seoDescription featuredPost sortOrder readingTimeOverride } } }
    categories(first: 2, where: { hideEmpty: false }) { nodes { slug name categoryFields { accent sortOrder } } }
    tags(first: 2, where: { hideEmpty: false }) { nodes { slug name } }
  }
`;

try {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length || !payload.data) {
    console.error("WordPress GraphQL contract verification failed.");
    console.error(JSON.stringify(payload.errors || payload, null, 2));
    process.exit(1);
  }
  console.log("WordPress GraphQL contract verification passed.");
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Projects sampled: ${payload.data.projects?.nodes?.length ?? 0}`);
  console.log(`Skills sampled: ${payload.data.skills?.nodes?.length ?? 0}`);
  console.log(`Published posts sampled: ${payload.data.posts?.nodes?.length ?? 0}`);
} catch (error) {
  console.error(`Unable to verify ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

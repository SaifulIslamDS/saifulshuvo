import { Icon } from "@/components/Icon";
import { AdminFlash } from "@/components/admin/AdminFlash";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { getPostTaxonomies } from "@/lib/posts/queries";
import {
  createCategoryAction,
  createTagAction,
  deleteCategoryAction,
  deleteTagAction,
  updateCategoryAction,
  updateTagAction,
} from "../actions";

type Props = { searchParams: Promise<{ success?: string; error?: string }> };

export default async function TaxonomiesPage({ searchParams }: Props) {
  const [params, taxonomies] = await Promise.all([searchParams, getPostTaxonomies()]);
  return (
    <>
      <div className="admin-page-head"><div><span className="eyebrow">Blog structure</span><h1>Categories and tags</h1><p>Maintain the controlled taxonomy used for navigation, filtering and SEO archives.</p></div></div>
      <AdminFlash success={params.success} error={params.error}/>
      <div className="admin-grid-two taxonomy-grid">
        <section className="admin-panel">
          <div className="panel-head"><div><span className="eyebrow">Categories</span><h2>{taxonomies.categories.length} categories</h2></div></div>
          <form action={createCategoryAction} className="taxonomy-create-form">
            <div className="form-row"><label>Name<input name="name" required placeholder="Data Engineering"/></label><label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="data-engineering"/></label></div>
            <label>Description<textarea name="description" rows={2} placeholder="What readers can expect in this category."/></label>
            <div className="form-row"><label>Accent<select name="accent" defaultValue="cyan"><option value="cyan">Cyan</option><option value="blue">Blue</option><option value="violet">Violet</option><option value="green">Green</option><option value="orange">Orange</option></select></label><label>Order<input name="sort_order" type="number" min={0} defaultValue={100}/></label></div>
            <button className="button button-primary" type="submit"><Icon name="plus" size={16}/> Add category</button>
          </form>
          <div className="taxonomy-list">
            {taxonomies.categories.map((category) => (
              <details key={category.id} className="taxonomy-edit-card">
                <summary><span className={`taxonomy-dot accent-${category.accent}`}/><span><strong>{category.name}</strong><small>/{category.slug} · order {category.sortOrder}</small></span><span>Edit</span></summary>
                <form action={updateCategoryAction.bind(null, category.id)}>
                  <div className="form-row"><label>Name<input name="name" required defaultValue={category.name}/></label><label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={category.slug}/></label></div>
                  <label>Description<textarea name="description" rows={2} defaultValue={category.description}/></label>
                  <div className="form-row"><label>Accent<select name="accent" defaultValue={category.accent}><option value="cyan">Cyan</option><option value="blue">Blue</option><option value="violet">Violet</option><option value="green">Green</option><option value="orange">Orange</option></select></label><label>Order<input name="sort_order" type="number" min={0} defaultValue={category.sortOrder}/></label></div>
                  <div className="taxonomy-edit-actions"><button className="button button-secondary" type="submit">Save category</button></div>
                </form>
                <form action={deleteCategoryAction.bind(null, category.id)} className="taxonomy-delete-form"><ConfirmSubmitButton className="row-action-danger" message={`Delete category “${category.name}”?`}>Delete category</ConfirmSubmitButton></form>
              </details>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <div className="panel-head"><div><span className="eyebrow">Tags</span><h2>{taxonomies.tags.length} tags</h2></div></div>
          <form action={createTagAction} className="taxonomy-create-form"><div className="form-row"><label>Name<input name="name" required placeholder="Data Engineering"/></label><label>Slug<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="data-engineering"/></label></div><button className="button button-primary" type="submit"><Icon name="plus" size={16}/> Add tag</button></form>
          <div className="taxonomy-tag-edit-list">
            {taxonomies.tags.map((tag) => (
              <article key={tag.id}>
                <form action={updateTagAction.bind(null, tag.id)}><input name="name" required defaultValue={tag.name}/><input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" defaultValue={tag.slug}/><button type="submit">Save</button></form>
                <form action={deleteTagAction.bind(null, tag.id)}><ConfirmSubmitButton className="row-action-danger" message={`Delete tag “${tag.name}”?`}>Delete</ConfirmSubmitButton></form>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

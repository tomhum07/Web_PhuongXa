using System;
using System.Collections.Generic;

namespace Web_Phuongxa.Domain.Entities;

public partial class Category
{
    public int CategoryId { get; set; }

    public int? ParentId { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

    public virtual ICollection<Category> InverseParent { get; set; } = new List<Category>();

    public virtual Category? Parent { get; set; }
}

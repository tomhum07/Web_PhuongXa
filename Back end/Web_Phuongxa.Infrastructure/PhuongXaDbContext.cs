using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Web_Phuongxa.Domain.Entities;

namespace Web_Phuongxa.Infrastructure;

public partial class PhuongXaDbContext : DbContext
{
    public PhuongXaDbContext()
    {
    }

    public PhuongXaDbContext(DbContextOptions<PhuongXaDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Web_Phuongxa.Domain.Entities.Application> Applications { get; set; }

    public virtual DbSet<ApplicationFile> ApplicationFiles { get; set; }

    public virtual DbSet<Article> Articles { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<ServiceCategory> ServiceCategories { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<GalleryImage> GalleryImages { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        if (optionsBuilder.IsConfigured)
        {
            return;
        }

        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? Environment.GetEnvironmentVariable("DefaultConnection");

        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            optionsBuilder.UseSqlServer(connectionString);
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Web_Phuongxa.Domain.Entities.Application>(entity =>
        {
            entity.HasKey(e => e.ApplicationId).HasName("PK__Applicat__C93A4C99912388DE");

            entity.HasIndex(e => e.ApplicationCode, "UQ__Applicat__1185325A792157C2").IsUnique();

            entity.Property(e => e.ApplicationCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Submitted");

            entity.Ignore(e => e.AdminNote);
            entity.Ignore(e => e.ApplicantId);
            entity.Ignore(e => e.ApproverId);
            entity.Ignore(e => e.SubmittedAt);
            entity.Ignore(e => e.UpdatedAt);
            entity.Ignore(e => e.Applicant);
            entity.Ignore(e => e.Approver);

            entity.Property<string>("ApplicantName").HasMaxLength(150);
            entity.Property<string>("IdentityNumber").HasMaxLength(50).IsUnicode(false);
            entity.Property<DateTime?>("DateOfBirth").HasColumnType("datetime");
            entity.Property<string>("Address").HasMaxLength(500);
            entity.Property<string>("AttachedFileUrl").HasMaxLength(500).IsUnicode(false);
            entity.Property<DateTime?>("CreatedAt").HasColumnType("datetime");

            entity.HasOne(d => d.Handler).WithMany(p => p.ApplicationHandlers)
                .HasForeignKey(d => d.HandlerId)
                .HasConstraintName("FK__Applicati__Handl__628FA481");

            entity.HasOne(d => d.Service).WithMany(p => p.Applications)
                .HasForeignKey(d => d.ServiceId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Applicati__Servi__60A75C0F");
        });

        modelBuilder.Entity<ApplicationFile>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__Applicat__6F0F98BF30A360C5");

            entity.Property(e => e.FileName).HasMaxLength(255);
            entity.Property(e => e.FileUrl)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.UploadedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Application).WithMany(p => p.ApplicationFiles)
                .HasForeignKey(d => d.ApplicationId)
                .HasConstraintName("FK__Applicati__Appli__6754599E");
        });

        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.ArticleId).HasName("PK__Articles__9C6270E8D47F58C3");

            entity.HasIndex(e => e.Slug, "UQ__Articles__BC7B5FB65D9566B5").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PublishedAt).HasColumnType("datetime");
            entity.Property(e => e.Slug)
                .HasMaxLength(300)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasDefaultValue("Draft");
            entity.Property(e => e.Summary).HasMaxLength(500);
            entity.Property(e => e.ThumbnailUrl)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
            entity.Property(e => e.ViewCount).HasDefaultValue(0);

            entity.HasOne(d => d.Approver).WithMany(p => p.ArticleApprovers)
                .HasForeignKey(d => d.ApproverId)
                .HasConstraintName("FK__Articles__Approv__5165187F");

            entity.HasOne(d => d.Author).WithMany(p => p.ArticleAuthors)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Articles__Author__5070F446");

            entity.HasOne(d => d.Category).WithMany(p => p.Articles)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Articles__Catego__4F7CD00D");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__AuditLog__5E54864851C256F6");

            entity.Property(e => e.ActionType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IpAddress)
                .HasMaxLength(45)
                .IsUnicode(false);
            entity.Property(e => e.TableName)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__AuditLogs__UserI__6FE99F9F");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A0B541CBBE6");

            entity.HasIndex(e => e.Slug, "UQ__Categori__BC7B5FB6C1023140").IsUnique();

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Slug)
                .HasMaxLength(150)
                .IsUnicode(false);

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .HasConstraintName("FK__Categorie__Paren__48CFD27E");
        });

        modelBuilder.Entity<ServiceCategory>(entity =>
        {
            entity.HasKey(e => e.ServiceCategoryId).HasName("PK__ServiceC__9AFB3F6A6F0C3E0A");

            entity.ToTable("ServiceCategories");

            entity.HasIndex(e => e.CategoryCode, "UQ__ServiceCa__23B97B32B0C6D4A8").IsUnique();

            entity.Property(e => e.ServiceCategoryId).HasColumnName("ServiceCategoryId");
            entity.Property(e => e.CategoryCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__Comments__C3B4DFCA12C20AB2");

            entity.Property(e => e.Content).HasMaxLength(500);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Article).WithMany(p => p.Comments)
                .HasForeignKey(d => d.ArticleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Comments__Articl__5629CD9C");

            entity.HasOne(d => d.HiddenBy).WithMany(p => p.CommentHiddenBies)
                .HasForeignKey(d => d.HiddenById)
                .HasConstraintName("FK__Comments__Hidden__5812160E");

            entity.HasOne(d => d.User).WithMany(p => p.CommentUsers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Comments__UserId__571DF1D5");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PK__Feedback__6A4BEDD692F1E02A");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.SenderName).HasMaxLength(100);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.RepliedBy).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.RepliedById)
                .HasConstraintName("FK__Feedbacks__Repli__6C190EBB");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.HasKey(e => e.PermissionId).HasName("PK__Permissi__EFA6FB2F0277D71B");

            entity.HasIndex(e => e.PermissionCode, "UQ__Permissi__91FE5750E6D99CB8").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.ModuleName).HasMaxLength(100);
            entity.Property(e => e.PermissionCode)
                .HasMaxLength(100)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Roles__8AFACE1A36706491");

            entity.HasIndex(e => e.RoleName, "UQ__Roles__8A2B6160BD16C678").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.RoleName).HasMaxLength(50);

            entity.HasMany(d => d.Permissions).WithMany(p => p.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "RolePermission",
                    r => r.HasOne<Permission>().WithMany()
                        .HasForeignKey("PermissionId")
                        .HasConstraintName("FK__RolePermi__Permi__3E52440B"),
                    l => l.HasOne<Role>().WithMany()
                        .HasForeignKey("RoleId")
                        .HasConstraintName("FK__RolePermi__RoleI__3D5E1FD2"),
                    j =>
                    {
                        j.HasKey("RoleId", "PermissionId").HasName("PK__RolePerm__6400A1A8FE3D45AD");
                        j.ToTable("RolePermissions");
                    });
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.ToTable("Services", tb => tb.UseSqlOutputClause(false));

            entity.HasKey(e => e.ServiceId).HasName("PK__Services__C51BB00AF62EBE92");

            entity.HasIndex(e => e.ServiceCode, "UQ__Services__A64C6B603DAA0A22").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Description).HasMaxLength(500);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Name).HasMaxLength(255);
            entity.Property(e => e.ProcedureFileUrl)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.ServiceCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.TemplateFileUrl)
                .HasMaxLength(500)
                .IsUnicode(false);

            entity.HasOne(d => d.ServiceCategory).WithMany(p => p.Services)
                .HasForeignKey(d => d.ServiceCategoryId)
                .HasConstraintName("FK__Services__Servic__5AEE82B9");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__Users__1788CC4C87D49360");

            entity.HasIndex(e => e.Username, "UQ__Users__536C85E410D8951E").IsUnique();

            entity.HasIndex(e => e.Email, "UQ__Users__A9D10534FFE05F60").IsUnique();

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Username)
                .HasMaxLength(50)
                .IsUnicode(false);

            entity.Ignore(e => e.ApplicationApplicants);
            entity.Ignore(e => e.ApplicationApprovers);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Users__RoleId__44FF419A");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

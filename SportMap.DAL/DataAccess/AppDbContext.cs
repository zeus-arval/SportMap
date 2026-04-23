using DomainLayer.Entities;
using Microsoft.EntityFrameworkCore;
using SportMap.DAL.Extensions;

namespace SportMap.DAL.DataContext
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<PrivacyType> PrivacyTypes => Set<PrivacyType>();
        public DbSet<Personalization> Personalization => Set<Personalization>();
        public DbSet<Post> Posts => Set<Post>();
        public DbSet<ImageData> Images => Set<ImageData>();
        public DbSet<Place> Places => Set<Place>();
        public DbSet<PlaceType> PlaceTypes => Set<PlaceType>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(user => user.GoogleId).IsUnique();
                entity.HasIndex(user => user.Email).IsUnique();
                entity.HasOne(user => user.UserRole)
                      .WithMany()
                      .HasForeignKey(user => user.UserRoleId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(user => user.Personalization)
                      .WithOne(personalization => personalization.User)
                      .HasForeignKey<Personalization>(personalization => personalization.UserId);
                entity.HasOne<ImageData>()
                      .WithMany()
                      .HasForeignKey(user => user.ProfilePictureId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<Personalization>(entity =>
            {
                entity.HasOne(personalization => personalization.BirthdatePrivacyType)
                      .WithMany()
                      .HasForeignKey(personalization => personalization.BirthdatePrivacyId);
            });

            modelBuilder.Entity<Post>(entity =>
            {
                entity.ConfigureBaseModelFields();
            });

            modelBuilder.Entity<ImageData>(entity =>
            {
                entity.ConfigureBaseModelFields();
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(img => img.UploaderId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne<User>()
                      .WithMany()
                      .HasForeignKey(img => img.ReviewerId)
                      .OnDelete(DeleteBehavior.SetNull);
            });
            
            modelBuilder.Entity<Place>(entity =>
            {
                entity.ConfigureBaseModelFields();
            });

            modelBuilder.Entity<PlaceType>(entity =>
            {
                entity.ConfigureBaseModelFields();
            });
        }
    }
}

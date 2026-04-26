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
        public DbSet<Event> Events => Set<Event>();
        public DbSet<EventParticipant> EventParticipants => Set<EventParticipant>();

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
                entity.HasOne(post => post.Author)
                      .WithMany()
                      .HasForeignKey(post => post.AuthorId)
                      .OnDelete(DeleteBehavior.SetNull);
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
                entity.HasOne<ImageData>()
                      .WithMany()
                      .HasForeignKey(p => p.ImageId)
                      .OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(p => p.Creator)
                      .WithMany()
                      .HasForeignKey(p => p.CreatorId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(p => p.Reviewer)
                      .WithMany()
                      .HasForeignKey(p => p.ReviewerId);
            });

            modelBuilder.Entity<PlaceType>(entity =>
            {
                entity.ConfigureBaseModelFields();
            });

            modelBuilder.Entity<Event>(entity =>
            {
                entity.ConfigureBaseModelFields();
                entity.HasOne(e => e.Place)
                      .WithMany()
                      .HasForeignKey(e => e.PlaceId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.HostUser)
                      .WithMany()
                      .HasForeignKey(e => e.HostUserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<EventParticipant>(entity =>
            {
                entity.ConfigureBaseModelFields();
                entity.HasOne(ep => ep.Event)
                      .WithMany(e => e.Participants)
                      .HasForeignKey(ep => ep.EventId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(ep => ep.User)
                      .WithMany()
                      .HasForeignKey(ep => ep.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasIndex(ep => new { ep.EventId, ep.UserId }).IsUnique();
            });
        }
    }
}

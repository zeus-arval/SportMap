using System.Text;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using SportMap.Al.Extensions;
using SportMap.DAL.Extensions;
using SportMap.PL.Controllers;

var builder = WebApplication.CreateBuilder(args);

// Load optional local secrets override (gitignored)
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Add service defaults & Aspire client integrations.
builder.AddServiceDefaults();
builder.AddRedisOutputCache("redis");
builder.AddNpgsqlDataSource(connectionName: "sportmapdb");

builder.Services.AddDALServices(builder.Configuration);
builder.Services.AddALServices();

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddTransient<FeedController>();
builder.Services.AddDataProtection();
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
builder.Services.AddCookiePolicy(options =>
{
    options.MinimumSameSitePolicy = builder.Environment.IsDevelopment()
        ? SameSiteMode.None
        : SameSiteMode.Lax;
   options.Secure = CookieSecurePolicy.SameAsRequest;
});

var secretKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("Jwt:SecretKey missing");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultScheme           = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme  = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultSignInScheme     = "Cookies";
    })
    .AddCookie("Cookies")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey    = true,
            IssuerSigningKey            = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer              = true,
            ValidIssuer                 = builder.Configuration["Jwt:Issuer"],
            ValidateAudience            = true,
            ValidAudience               = builder.Configuration["Jwt:Audience"],
            ValidateLifetime            = true,
            ClockSkew                   = TimeSpan.FromSeconds(30),
        };
        options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (string.IsNullOrEmpty(ctx.Token))
                    ctx.Token = ctx.Request.Cookies["access_token"];
                return Task.CompletedTask;
            }
        };
    })
    .AddGoogle(options =>
    {
        var clientId = builder.Configuration["Google:ClientId"];
        var clientSecret = builder.Configuration["Google:ClientSecret"];

        if (!string.IsNullOrEmpty(clientId) && !string.IsNullOrEmpty(clientSecret))
        {
            options.ClientId = clientId;
            options.ClientSecret = clientSecret;
        }
        else
        {
            options.ClientId = "disabled";
            options.ClientSecret = "disabled";
        }
    });

builder.Services.AddAuthorization();

var app = builder.Build();

var forwardedOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost
};
forwardedOptions.KnownNetworks.Clear();
forwardedOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedOptions);

// Configure the HTTP request pipeline.
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("AllowAll");
app.UseOutputCache(); // must come after UseCors so cached responses include CORS headers
app.MapDefaultEndpoints();
app.UseCookiePolicy();
app.UseAuthentication();
app.UseAuthorization();
app.UseFileServer();
app.MapControllers();

app.Run();

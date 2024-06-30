using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

//Dictionary<string, Point> mappings = new Dictionary<string, Point>();
var mappings = new Dictionary<string, Point>();
mappings.Add("Bowser", new Point(0,300));
mappings.Add("Captain Falcon", new Point(125,0));
mappings.Add("Donkey Kong", new Point(0,250));
mappings.Add("Dr. Mario", new Point(10,200));
mappings.Add("Falco", new Point(120,0));
mappings.Add("Fox", new Point(0,100));
mappings.Add("Ganondorf", new Point(0,50));
mappings.Add("Ice Climbers", new Point(50,300));
mappings.Add("Jigglypuff", new Point(130,250));
mappings.Add("Kirby", new Point(120,280));
mappings.Add("Link", new Point(0,100));
mappings.Add("Luigi", new Point(130,20));
mappings.Add("Mario", new Point(100,0));
mappings.Add("Marth", new Point(100,0));
mappings.Add("Mewtwo", new Point(120,0));
mappings.Add("Mr. Game & Watch", new Point(0,200));
mappings.Add("Ness", new Point(150,0));
mappings.Add("Peach", new Point(100,0));
mappings.Add("Pichu", new Point(220,0));
mappings.Add("Pikachu", new Point(0,0));
mappings.Add("Roy", new Point(60,150));
mappings.Add("Samus", new Point(120,0));
mappings.Add("Sheik", new Point(120,440));
mappings.Add("Yoshi", new Point(100,0));
mappings.Add("Young Link", new Point(210,40));
mappings.Add("Zelda", new Point(180,0));

var dirs = Directory.GetDirectories("./Melee");
foreach(var dir in dirs){
    Console.WriteLine(dir);
    if(!Directory.Exists(dir + "/CroppedSkins")){
        Directory.CreateDirectory(dir + "/CroppedSkins");
    }
    var skins = Directory.GetFiles(dir + "/Skins");
    foreach(var skin in skins){
        // Console.WriteLine(skin);
        // Idiots regex
        if(skin.Contains(".png")){
            var skinFileName = skin.Split("/").Last();
            var newPath = dir + "/CroppedSkins/" + skinFileName;
            var key = skinFileName.Split("(").First().Trim();
            File.Copy(dir + "/Skins/" + skinFileName, newPath, true);
            Console.WriteLine(newPath);
            using (Image image = Image.Load(newPath)) 
            {
                image.Mutate(ctx => ctx.Crop(new Rectangle(mappings[key], new Size(768, 960))));
                // image.Mutate(x => x.Resize(image.Width / 2, image.Height / 2)); 
                image.Save(newPath); 
            }
        }
    }
}

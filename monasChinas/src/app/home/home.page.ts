import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filesystem, FilesystemDirectory, FilesystemEncoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Plugins } from '@capacitor/core';
const { Permissions } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  imageUrl: string = '';

  constructor(private http: HttpClient) {}

  async requestPermissions() {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Permissions["request"]({
        permissions: ['storage']
      });
      console.log('Permissions:', permissions);
    }
  }

  loadImage() {
    setTimeout(() => {
      this.http.get<{ url: string }>('https://api.waifu.pics/sfw/waifu').subscribe(
        response => {
          this.imageUrl = response.url;
        },
        error => {
          console.error('Error loading image', error);
        }
      );
    }, 5000); // 5000 milliseconds = 5 seconds
  }

  async saveImage() {
    if (this.imageUrl) {
      const response = await this.http.get(this.imageUrl, { responseType: 'blob' }).toPromise();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const fileName = 'waifu_image.jpg';
        try {
          const result = await Filesystem.writeFile({
            path: fileName,
            data: base64data,
            directory: FilesystemDirectory.Documents,
            encoding: FilesystemEncoding.UTF8
          });
          console.log('Image saved successfully', result);
        } catch (error) {
          console.error('Error saving image', error);
        }
      };
      reader.readAsDataURL(response as Blob);
    }
  }

  ngOnInit() {
    this.requestPermissions();
  }
}

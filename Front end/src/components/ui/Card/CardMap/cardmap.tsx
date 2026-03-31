import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function CardMap() {
  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Vị trí Phường Cao Lãnh
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="relative h-72 w-full overflow-hidden rounded-lg sm:h-80">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d75122.46348379116!2d105.58999479176944!3d10.445531319141818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a65057df94f39%3A0x1d6b899429240cd4!2zQ2FvIEzDo25oLCDEkOG7k25nIFRow6FwLCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1774287641651!5m2!1svi!2s"
            className="w-full h-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
}

export default CardMap;
